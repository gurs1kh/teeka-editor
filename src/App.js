import { useState, useEffect } from 'react';
import { useLocalStorage } from 'react-use';
import './App.css';
import ReactPrismEditor from "react-prism-editor";
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

function superscriptize(text) {
  return text.replace(/\^(\d+)/g, (match, n) => {
    return n.toString().split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
  });
}

function parseText(text) {
  const verses = text.split(/\n(?=#+)/);

  return verses.map((verseText, id) => {
    const title = !!verseText.match(/###/);
    const sirlekh = !!verseText.match(/##/);
    const gurmukhi = superscriptize(verseText.match(/# (.+)/)[1]);
    const padArth = {};
    const padArthMatches = verseText.matchAll(/(\d+) (.+)\n(- (.+))?/g);
    [...padArthMatches].map(match => {
      const num = match[1];
      const punjabi = match[2];
      const english = match[4];
      padArth[superscriptize(`^${num}`)] = { punjabi, english };
    });
    const arthMatches = verseText.matchAll(/[-#].+\n(\(?[ਅ-ੴ].+)\n((\(?\w.*)\n)?/g);
    const [_,  punjabi, english ] = [...arthMatches]?.[0] || ['', '', ''];

    return {
      id,
      gurmukhi,
      title,
      sirlekh,
      padArth,
      arth: { punjabi, english },
    };
  });
}

function App() {
  const [ code, setCode ] = useLocalStorage('code', '');
  const [ verses, setVerses ] = useState([]);

  useEffect(() => updateCode(code), []);

  function updateCode(code) {
    // temp solution: ensure at least 10 new lines at end of the file
    let endingNewLineCount = code.length - (code.match(/\n+$/)?.index || code.length);
    code += ''.padEnd(10 - endingNewLineCount, '\n');

    setCode(code);
    try {
      setVerses(parseText(code));
    } catch (e) {
      setVerses([{ arth: { english: e.stack }}]);
      console.error(e);
    }
  }

  return (
    <div className="app">
      <SplitterLayout primaryIndex={0} percentage={true} secondaryInitialSize={60}>
        <div id="json-editor">
          <ReactPrismEditor
            language="markup"
            theme="default"
            lineNumber={true}
            code={code}
            changeCode={newCode => updateCode(newCode)}
            height='100vw'
          />
        </div>
        <div id="rendered-view">
          <div className="page">
            {verses.map(verse => <Verse verse={verse} key={verse.id} />)}
          </div>
        </div>
      </SplitterLayout>
    </div>
  );
}

function Verse({ verse }) {
  if (!verse) return (<p></p>);

  const className = [
    'verse',
    verse.title && 'title',
    verse.sirlekh && 'sirlekh',
  ].filter(d => d).join(' ');

  let padArth = Object.entries(verse.padArth || {}).map(([key, arth]) => {
    return (
      <span key={key}>
        {key}
        {arth.punjabi && <span className='punjabi'>{arth.punjabi}{' '}</span>}
        <span className='english'>{arth.english}{' '}</span>
      </span>
    );
  });

  return (
    <div className={className} id={`verse-${verse.id}`}>
      <p className='gurmukhi'>{verse.gurmukhi}</p>
      <div className='pad-arth'>
         <p>{padArth}</p>
      </div>
      <div className='arth'>
        <p className='punjabi'>{verse.arth?.punjabi}</p>
        <p className='english'>{verse.arth?.english}</p>
      </div>
    </div>
  );
}

export default App;
