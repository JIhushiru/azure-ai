import { useState} from 'react';
// import { useRef } from 'react';
// import {uploadFile, checkIndex} from './services/api';
import {askQuestion} from './services/api';
import { Circles } from 'react-loader-spinner';
import './App.css';
import ReactMarkdown from 'react-markdown';
// import Sources from './components/Sources';

// type SourceChunk = {
//   source: string;
//   content: string;
// };

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  // const [sources, setSources] = useState<SourceChunk[]>([]);
  // const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  // const fileInputRef = useRef<HTMLInputElement>(null);
  // const [indexingStatus, setIndexingStatus] = useState<'idle' | 'indexing' | 'done' | 'error'>('idle');

  // const waitForIndex = async (filename: string) => {
  //   const poll = async () => {
  //     try {
  //       const res = await checkIndex(filename);
  //       if (res.found) {
  //         setIndexingStatus('done'); // File indexed
  //           if (fileInputRef.current) {
  //           fileInputRef.current.value = '';
  //       }
  //       } else {
  //         setTimeout(poll, 5000);    // Wait 5s then poll again
  //       }
  //     } catch (err) {
  //       console.error('Failed to get indexer status:', err);
  //       setIndexingStatus('error'); // failure on API
  //     }
  //   };

  //   poll();
  // };

  // const handleFileUpload = async (e: any) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   try {
  //     setIndexingStatus('indexing');
  //     await uploadFile(file);
  //     waitForIndex(file.name);
  //   } catch (err) {
  //     console.error('Upload error:', err);
  //     setIndexingStatus('error');  
  //   } finally {
  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = '';
  //     }
  //   }
  // };




  const askBot = async () => {
    setLoading(true);
    setAnswer('');
    // setSources([]);

    try {
      const res = await askQuestion(question);
      setAnswer(res.answer);
      // setSources(res.sources || []);
    } catch (err) {
      setAnswer("Something went wrong.");
      console.error(err);
    }

    setLoading(false);
  };


  return (
    <div className="app-container">
      <h1>📚 JerChatbot</h1>

      <textarea
        className="question-input"
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask me something from your documents..."
      />

      <button onClick={askBot} disabled={loading} className="ask-button">
        {loading ? 'Thinking...' : 'Ask'}
      </button>

      {loading && (
        <div className="spinner">
          <Circles height="40" width="40" color="#4fa94d" ariaLabel="loading" />
        </div>
      )}

      {/* {indexingStatus === 'indexing' && (
        <div className="spinner">
          <Circles height="40" width="40" color="#0078D4" ariaLabel="indexing" />
          <span className="indexing-text">Indexing document...</span>
        </div>
      )}

      {indexingStatus === 'done' && (
        <div className="status-message success">File indexed and ready!</div>
      )}

      {indexingStatus === 'error' && (
        <div className="status-message error">Upload failed or indexing timed out.</div>
      )} */}


      {answer && (
        <div className="answer-box">
          <strong>Answer:</strong>
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      )}

      {/* <input type="file" onChange={handleFileUpload} className="file-input" ref={fileInputRef} />

      <Sources
        sources={sources}
        expandedSources={expandedSources}
        setExpandedSources={setExpandedSources}
      /> */}

    </div>
  );
}

export default App;
