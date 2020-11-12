import { useState, useEffect } from 'react';
import { useLocalStorage } from 'react-use';
import './App.css';
import ReactPrismEditor from "react-prism-editor";
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';

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
      if (code[0] != '[') code = `[${code}]`;
      code = code.replace(/\^(\d)/g, (match, d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]);
      let verses = eval(code);
      setVerses(verses);
    } catch (e) {
      console.error(`${e}\n${code}`)
    };
  }

  return (
    <div className="app">
      <SplitterLayout primaryIndex={0} percentage={true} secondaryInitialSize={60}>
        <div className="json-editor">
          <ReactPrismEditor
            language="javascript"
            theme="default"
            lineNumber={true}
            code={code}
            changeCode={newCode => updateCode(newCode)}
            height='100vw'
          />
        </div>
        <div className="rendered-view">
          <div className="page">
            {verses.map((verse, i) => <Verse verse={verse} key={i} />)}
          </div>
        </div>
      </SplitterLayout>
    </div>
  );
}

function Verse({ verse }) {
  const className = [
    'gurmukhi',
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
    <div className='verse'>
      <p className={className}>{verse.gurmukhi}</p>
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
