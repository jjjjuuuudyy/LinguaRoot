import { useState, useEffect } from 'react';
import {
  Container, Button, InputGroup, Form, Dropdown, Tabs, Tab
} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaPlayCircle } from 'react-icons/fa';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { authChanges } from "../../src/userServives/userServive";
import PermissionProtect from "../userServives/permissionProtect";
import axios from 'axios';
import "../../static/css/_favorite/index_judy.css"

const StarRating = ({ frequency }) => {
  if (!frequency) return null;
  const starCount = (frequency.match(/★/g) || []).length;
  const match = frequency.match(/\((\d+)\)/);
  const count = match ? match[1] : '';
  return (
    <div className="star-rating">
      {[...Array(starCount)].map((_, i) => (
        <span key={i} className="star">⭐</span>
      ))}
    </div>
  );
};

//播放按鈕組件
const AudioButton = ({ audioUrl, onPlay, size }) => {
  if (!audioUrl) return null;
  return (
    <Button
      variant="link"
      className="audio-button"
      onClick={(e) => {
        e.stopPropagation();
        onPlay(audioUrl);
      }}
    >
      <FaPlayCircle size={size} className="text-warning" />
    </Button>
  );
};

const WordCardImage = ({ imageUrl, word, isFavorited, onToggleFavorite }) => {
  const defaultImage = `https://www.shutterstock.com/image-vector/no-image-vector-symbol-missing-260nw-2151420819.jpg`;

  return (
    <div className="word-image-wrapper">
      <img
        src={imageUrl || defaultImage}
        alt={word}
        className="word-image"
      />

      <Button
        variant="link"
        className="favorite-btn"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        {isFavorited ? <FaHeart color="#dc2626" /> : <FaRegHeart color="#6b7280" />}
      </Button>
    </div>
  );
};

const WordCardInfo = ({ result, word, playAudio, category }) => (
  <div className="favorite-word-info">
    <h3 className="tayal-word">
      {result.word_tayal || '無資料'}
      <AudioButton audioUrl={result.word_audio} onPlay={playAudio} size={18} />
    </h3>
    <h5 className="chinese-word">{word}</h5>

    <div className="word-meta">
      {result.word_fre && (
        <div className="word-frequency-label">
          詞頻：<StarRating frequency={result.word_fre} />
        </div>
      )}
      {result.word_str && (
        <div className="word-category-label">
          {category}
        </div>
      )}
    </div>
  </div>
);

//例句組件
const ExampleItem = ({ example, playAudio }) => {
  const hasText = example.ex_tay?.trim() || example.ex_ch?.trim();
  if (!hasText) return null;

  return (
    <div className="example-item">
      <div className="example-tayal">
        {example.ex_tay}
        <AudioButton audioUrl={example.ex_tay_audio} onPlay={playAudio} size={14} />
      </div>
      <div className="example-ch">{example.ex_ch}</div>
    </div>
  );
};

//詳情組件
const DefinitionDetails = ({ definitions, playAudio }) => {
  if (!definitions?.length) return null;

  return (
    <div className="definitions-container">
      {definitions.map((def, i) => (
        <div key={i} className="definition-item">
          {def.word_cate && (
            <h6 className="definition-category">
              <strong>例句</strong>
            </h6>
          )}

          {def.examples?.length > 0 && (
            <div className="examples-container">
              {def.examples.map((example, ei) => (
                <ExampleItem
                  key={ei}
                  example={example}
                  playAudio={playAudio}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

//單字卡
const WordCardWithImg = ({ word, category, result, keyName, expandedWord, toggleExpand, toggleFavorite, playAudio, isFavorited }) => {
  const isFlipped = expandedWord === keyName;

  return (
    <div className="word-card-container" key={keyName}>
      <div className={`word-card ${isFlipped ? 'flipped' : ''}`}>
        {/* 正面 */}
        <div className="word-card-front" onClick={() => toggleExpand(keyName)}>
          <WordCardImage
            imageUrl={result.word_img}
            word={result.word_tayal}
            isFavorited={isFavorited}
            onToggleFavorite={toggleFavorite}
          />

          <div className="word-card-header">
            <WordCardInfo
              result={result}
              word={word}
              playAudio={playAudio}
              category={category}
            />
          </div>
        </div>

        {/* 背面 */}
        <div className="word-card-back" onClick={() => toggleExpand(keyName)}>
          <div className="word-card-back-header">
            <h4 className="tayal-word-back">
              {result.word_tayal || '無資料'}
              <AudioButton audioUrl={result.word_audio} onPlay={(e) => {
                e.stopPropagation();
                playAudio(result.word_audio);
              }} size={18} />
            </h4>
            <h5 className="chinese-word-back">{word}</h5>
          </div>

          <div className="word-card-details">
            <DefinitionDetails
              definitions={result.defins}
              playAudio={(url) => {
                playAudio(url);
              }}
            />
          </div>

          {/* 返回按鈕 */}
          <div className="flip-back-btn">
            <small className="text-muted">點擊返回</small>
          </div>
        </div>
      </div>
    </div>
  );
};

//搜尋篩選組件
const SearchAndFilterControls = ({ tab, state, onStateChange, alphabet }) => (
  <>
    <InputGroup className="mb-3">
      <Form.Control
        placeholder="請輸入查詢內容"
        value={state.inputValue || ''}
        onChange={e => onStateChange('inputValue', e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            onStateChange('activeQuery', state.inputValue);
          }
        }}
      />
      <Button
        variant="danger"
        onClick={() => onStateChange('activeQuery', state.inputValue)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
        </svg>
      </Button>
    </InputGroup>

    <div className="d-flex align-items-center flex-wrap gap-2">
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => onStateChange('sortOrder', state.sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        排序：{state.sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
      </Button>

      <Dropdown onSelect={(val) => onStateChange('filterLetter', val)}>
        <Dropdown.Toggle variant="outline-secondary" size="sm">
          開頭：{state.filterLetter || '全部'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item eventKey="">全部</Dropdown.Item>
          {alphabet.map(l => (
            <Dropdown.Item key={l} eventKey={l}>{l}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown onSelect={(val) => onStateChange('frequencyFilter', val)}>
        <Dropdown.Toggle variant="outline-secondary" size="sm">
          詞頻：{state.frequencyFilter ? `${state.frequencyFilter}★` : '全部'}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item eventKey="">全部</Dropdown.Item>
          {[4, 3, 2, 1].map(n => (
            <Dropdown.Item key={n} eventKey={n}>{`${n}★`}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  </>
);

//狀態管理
const useTabState = (favorites) => {
  const [tabStates, setTabStates] = useState({});

  useEffect(() => {
    const newTabStates = {};
    favorites.forEach(fav => {
      if (!tabStates[fav.id]) {
        newTabStates[fav.id] = {
          inputValue: '',
          activeQuery: '',
          sortOrder: 'asc',
          filterLetter: '',
          frequencyFilter: ''
        };
      } else {
        newTabStates[fav.id] = tabStates[fav.id];
      }
    });
    setTabStates(newTabStates);
  }, [favorites]);

  const updateTabState = (tabId, key, value) => {
    setTabStates(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        [key]: value
      }
    }));
  };

  return [tabStates, updateTabState];
};

//篩選和排序功能
const useFilterAndSort = (allWords) => {
  const matchSearchCriteria = (wordObj, query) => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    const tayal = (wordObj.word_tayal || '').toLowerCase();
    const ch = (wordObj.word_ch || '').toLowerCase();
    const defins = wordObj.defins || [];

    return (
      tayal.includes(lowerQuery) ||
      ch.includes(lowerQuery) ||
      defins.some(def => (def.word_ch || '').toLowerCase().includes(lowerQuery))
    );
  };

  const filterAndSort = (contentIds, state) => {
    return allWords
      .filter(w => {
        const tayal = (w.word_tayal || '').toLowerCase();
        const matchId = contentIds.includes(w.word_tayal);
        const matchLetter = !state.filterLetter || tayal.startsWith(state.filterLetter);
        const starCount = (w.word_fre?.match(/★/g) || []).length;
        const matchFreq = !state.frequencyFilter || starCount === parseInt(state.frequencyFilter);
        const matchQuery = matchSearchCriteria(w, state.activeQuery);

        return matchId && matchLetter && matchFreq && matchQuery;
      })
      .sort((a, b) => {
        const aWord = (a.word_tayal || '').toLowerCase();
        const bWord = (b.word_tayal || '').toLowerCase();
        return state.sortOrder === 'asc' ? aWord.localeCompare(bWord) : bWord.localeCompare(aWord);
      });
  };

  return filterAndSort;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [allWords, setAllWords] = useState([]);
  const [expandedWord, setExpandedWord] = useState(null);
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [delayedCheck, setDelayedCheck] = useState(false);
  const toggleExpand = (key) => setExpandedWord(prev => (prev === key ? null : key));

  const [tabStates, updateTabState] = useTabState(favorites);
  const filterAndSort = useFilterAndSort(allWords);

  const location = useLocation();
  const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(97 + i)).concat("'");

  useEffect(() => {
    if (location.state?.tabId) {
      setActiveTab(location.state.tabId);
    }
  }, [location.state]);
  useEffect(() => {
    setLoading(true);
    axios.post('http://127.0.0.1:8001/dictionary/all/')
      .then(res => {
        setAllWords(Object.values(res.data.all_results).flat());
        setLoading(false);
      })
      .catch(err => {
        console.error("載入單字失敗：", err);
        setLoading(false);
      });

    const unsubscribe = authChanges((userData) => {
      if (userData) {
        setUser(userData);
        setFavorites(userData.firestoreData.favorites || []);
      }
    });

    const timer = setTimeout(() => setDelayedCheck(true), 1500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
      if (audio) audio.pause();
    };
  }, []);

  const playAudio = (url) => {
    if (url) {
      if (audio) audio.pause();
      const newAudio = new Audio(url);
      newAudio.play().catch(err => console.error("音頻播放失敗：", err));
      setAudio(newAudio);
    }
  };

  const toggleFavorite = async (wordTayal, categoryId) => {
    try {
      const updatedFavorites = favorites.map(fav => {
        if (fav.id !== categoryId) return fav;

        const exists = fav.content.includes(wordTayal);
        const newContent = exists
          ? fav.content.filter(w => w !== wordTayal)
          : [...fav.content, wordTayal];

        return { ...fav, content: newContent };
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { favorites: updatedFavorites });
      setFavorites(updatedFavorites);
    } catch (err) {
      console.error("收藏操作失敗：", err);
    }
  };

  if (!user && delayedCheck) return <PermissionProtect />;

  const currentTab = favorites.find(t => t.id === activeTab);
  const currentState = tabStates[activeTab] || {};
  const filteredWords = currentTab ? filterAndSort(currentTab.content, currentState) : [];

  return (
    <Container className="p-2 word-library-container">
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 900,
          backgroundColor: 'white',
          paddingTop: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <h2 className="fw-bold d-flex align-items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-heart me-2" viewBox="0 0 16 16">
            <path d="M8 2.748L7.283 2.01C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 3.905C2.634 8.313 4.548 10.13 8 12.343c3.452-2.213 5.365-4.03 6.286-5.385.955-1.405.838-2.882.314-3.905C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171.057-.059.116-.115.176-.17C12.72-3.042 23.333 4.867 8 15z" />
          </svg>
          個人詞語庫
        </h2>
        
        {/* <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(parseInt(k))}
          justify
          className="mb-3"
        >
          {favorites.map(tab => (
            <Tab key={tab.id} eventKey={tab.id} title={tab.title} />
          ))}
        </Tabs> */}

        {currentTab && (
          <SearchAndFilterControls
            tab={currentTab}
            state={currentState}
            onStateChange={(key, value) => updateTabState(activeTab, key, value)}
            alphabet={alphabet}
          />
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="text-muted">載入中...</div>
        </div>
      ) : (
        <div className="word-cards-grid">
          {filteredWords.map((wordData, idx) => (
            <WordCardWithImg
              key={wordData.word_tayal + idx}
              keyName={wordData.word_tayal + idx}
              word={wordData.word_ch || wordData.defins?.[0]?.word_ch || ''}
              category={wordData.defins?.[0]?.word_cate || ''}
              result={wordData}
              expandedWord={expandedWord}
              toggleExpand={toggleExpand}
              toggleFavorite={() => toggleFavorite(wordData.word_tayal, currentTab.id)}
              playAudio={playAudio}
              isFavorited={currentTab?.content.includes(wordData.word_tayal)}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default App;