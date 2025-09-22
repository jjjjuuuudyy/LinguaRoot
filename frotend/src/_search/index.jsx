import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, ListGroup, Alert, Spinner, Button, InputGroup, Form,
  Dropdown, Offcanvas
} from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaPlayCircle } from 'react-icons/fa';
import { toggleFavoriteWord, authChanges } from "../../src/userServives/userServive";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const renderStars = (fre) => {
  if (!fre) return null;
  const starCount = (fre.match(/★/g) || []).length;
  const match = fre.match(/\((\d+)\)/);
  const count = match ? match[1] : '';
  return (
    <>
      {[...Array(starCount)].map((_, i) => (
        <span key={i} style={{ color: '#FFC107', fontSize: '1rem', marginRight: '1px' }}>⭐</span>
      ))}
      {count && <span style={{ marginLeft: '2px', color: '#666' }}>（{count}）</span>}
    </>
  );
};

const WordCard = ({ word, result, keyName, expandedWord, toggleExpand, toggleFavorite, playAudio, isFavorited }) => (
  <ListGroup.Item key={keyName} className="d-flex flex-column">
    <div className="d-flex justify-content-between align-items-center">
      <div onClick={() => toggleExpand(keyName)} style={{ cursor: 'pointer', flex: 1 }}>
        <h3 className="fw-bolder text-danger">
          {result.word_tayal || '無資料'}
          {result.word_audio && (
            <Button variant="link" onClick={(e) => { e.stopPropagation(); playAudio(result.word_audio); }}>
              <FaPlayCircle size={20} className="text-warning" />
            </Button>
          )}
        </h3>
        <h5 className="fw-bolder">{word}</h5>
      </div>
      <Button variant="link" onClick={() => toggleFavorite(keyName)}>
        {isFavorited ? <FaHeart color="red" /> : <FaRegHeart color="black" />}
      </Button>
    </div>
    {expandedWord === keyName && (
      <div className="mt-2 pt-2 border-top">
        <ListGroup variant="flush">
          <ListGroup.Item><strong>詞頻：</strong>{renderStars(result.word_fre)}</ListGroup.Item>
          <ListGroup.Item><strong>分類：</strong>{result.word_str || ''}</ListGroup.Item>
          {result.defins?.map((def, i) => (
            <ListGroup.Item key={i}>
              <h5 className="fw-bolder">{def.word_ch || ''}</h5>
              <h6><strong>分類：</strong>{def.word_cate || ''}</h6><br />
              {def.examples?.map((ex, ei) => {
                const hasText = ex.ex_tay?.trim() || ex.ex_ch?.trim();
                if (!hasText) return null;
                return (
                  <ListGroup.Item key={`${i}-${ei}`}>
                    <h6 className="fw-bolder text-danger">
                      {ex.ex_tay}
                      {ex.ex_tay_audio && (
                        <Button variant="link" onClick={() => playAudio(ex.ex_tay_audio)}>
                          <FaPlayCircle size={20} className="text-warning" />
                        </Button>
                      )}
                    </h6>
                    <h6 className="fw-bolder">{ex.ex_ch}</h6>
                  </ListGroup.Item>
                );
              })}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    )}
  </ListGroup.Item>
);

const App = () => {
  const [query, setQuery] = useState('');
  const [definitions, setDefinitions] = useState({ exact_match_results: {}, fuzzy_match_results: {}, all_results: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedWord, setExpandedWord] = useState(null);
  const [favoriteWords, setFavoriteWords] = useState(new Set());
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterLetter, setFilterLetter] = useState('');
  const [audio, setAudio] = useState(null);
  const [user, setUser] = useState(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);




  const toggleExpand = (key) => setExpandedWord(prev => (prev === key ? null : key));

  const toggleFavorite = async (wordTayal) => {
    setFavoriteWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordTayal)) {
        newSet.delete(wordTayal);
      } else {
        newSet.add(wordTayal);
      }
      return newSet;
    });


    try {

      const baseCategory = user.firestoreData.favorites.find(fav => fav.id === 1);
      let newContent = baseCategory?.content || [];

      if (newContent.includes(wordTayal)) {

        newContent = newContent.filter(w => w !== wordTayal);
      } else {

        newContent = [...newContent, wordTayal];
      }


      await updateUserFavoritesCategory(user.uid, 1, newContent);

      setUser(prevUser => {
        if (!prevUser) return prevUser;
        const newFavorites = prevUser.firestoreData.favorites.map(fav => {
          if (fav.id === 1) {
            return { ...fav, content: newContent };
          }
          return fav;
        });
        return {
          ...prevUser,
          firestoreData: {
            ...prevUser.firestoreData,
            favorites: newFavorites
          }
        };
      });
    } catch (err) {
      console.error('同步收藏失敗', err);
    }

  };

  async function updateUserFavoritesCategory(userId, categoryId, newContent) {
    const userDocRef = doc(db, "users", userId);

    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) throw new Error("使用者文件不存在");

    const userData = userSnap.data();
    const favorites = userData.favorites || [];

    const newFavorites = favorites.map(fav => {
      if (fav.id === categoryId) {
        return { ...fav, content: newContent };
      }
      return fav;
    });

    await updateDoc(userDocRef, { favorites: newFavorites });
  }

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (query.trim() === '') {
        res = await axios.post('http://127.0.0.1:8001/dictionary/all/');
        console.log('API回傳(search):', res.data);
        setDefinitions({ exact_match_results: {}, fuzzy_match_results: {}, all_results: res.data.all_results || {} });
      } else {
        res = await axios.post('http://127.0.0.1:8001/dictionary/allsearch/', { keyword: query.trim() });
        console.log('API回傳(search):', res.data);
        setDefinitions({
          exact_match_results: Array.isArray(res.data.exact_match_results) ? { [query.trim()]: res.data.exact_match_results } : res.data.exact_match_results,
          fuzzy_match_results: res.data.fuzzy_match_results || {},
          all_results: {}
        });
      }
    } catch (e) {
      setError('查詢失敗: ' + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  useEffect(() => {
    const saved = localStorage.getItem('favoriteWords');
    if (saved) setFavoriteWords(new Set(JSON.parse(saved)));
    handleSearch();
    const unsubscribe = authChanges(async (userData) => {
      //console.log("authChanges 回傳:", userData);
      if (userData) {
        setUser(userData);
        const baseCategory = userData.firestoreData.favorites.find(fav => fav.id === 1);
        const favoriteSet = new Set(baseCategory?.content || []);
        setFavoriteWords(favoriteSet);
      } else {
        setUser(null);
        setFavoriteWords(new Set());
      }
    });
    return () => unsubscribe();
  }, []);

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(audioUrl);
      newAudio.play();
      setAudio(newAudio);
    }
  };



  const filterAndSortWords = (words) => {
    return words
      .filter(w => {
        const tayal = (w.word_tayal || '').toLowerCase();
        const matchesLetter = !filterLetter || tayal.startsWith(filterLetter);
        const isFavorite = favoriteWords.has(w.word_tayal);

        const fre = w.word_fre || '';
        const starCount = (fre.match(/★/g) || []).length;
        const matchesFrequency = !frequencyFilter || starCount === parseInt(frequencyFilter);

        return matchesLetter && (!showOnlyFavorites || isFavorite) && matchesFrequency;
      })
      .sort((a, b) => {
        const aFirst = (a.word_tayal || '').toLowerCase();
        const bFirst = (b.word_tayal || '').toLowerCase();
        return sortOrder === 'asc' ? aFirst.localeCompare(bFirst) : bFirst.localeCompare(aFirst);
      });
  };
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)).concat("'");


  return (
    <Container className="p-4">
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'white',
        zIndex: 900,
        paddingBottom: '1rem',
        marginBottom: '1rem',
        borderBottom: '1px solid #ccc'
      }}>
        <br />
        <h2 className="fw-bolder center" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', marginBottom: 0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>&nbsp; 單詞查詢
        </h2>
        <br />
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="請輸入查詢內容"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button variant="danger" onClick={handleSearch} style={{ maxWidth: '60px', paddingLeft: '6px', paddingRight: '6px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
          </Button>
        </InputGroup>
        <div className="d-flex mb-3 align-items-center">
          {isMobile ? (
            <>
              <Button variant="outline-dark" className="mb-3" onClick={() => setShowFilterPanel(true)}>
                篩選 / 排序
              </Button>

              <Offcanvas show={showFilterPanel} onHide={() => setShowFilterPanel(false)} placement="end">
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title>篩選 / 排序選項</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                  <div className="d-flex flex-column gap-3">
                    <Button
                      variant="outline-dark"
                      onClick={() => {
                        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                        setShowFilterPanel(false);
                      }}
                    >
                      排序： {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
                    </Button>

                    <Dropdown onSelect={val => {
                      setFilterLetter(val);
                      setShowFilterPanel(false);
                    }}>
                      <Dropdown.Toggle variant="outline-dark" className="btn">
                        開頭： {filterLetter || '全部'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item eventKey="">全部</Dropdown.Item>
                        {alphabet.map(l => (
                          <Dropdown.Item key={l} eventKey={l}>{l}</Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>

                    <Dropdown onSelect={(val) => {
                      setFrequencyFilter(val);
                      setShowFilterPanel(false);
                    }}>
                      <Dropdown.Toggle variant="outline-dark">
                        詞頻： {frequencyFilter ? `${frequencyFilter}★` : '全部'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item eventKey="">全部</Dropdown.Item>
                        {[4, 3, 2, 1].map(n => (
                          <Dropdown.Item key={n} eventKey={n}>{`${n}★`}</Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>

                    <Button
                      variant={showOnlyFavorites ? "danger" : "outline-dark"}
                      onClick={() => {
                        setShowOnlyFavorites(prev => !prev);
                        setShowFilterPanel(false);
                      }}
                    >
                      {showOnlyFavorites ? '顯示全部' : '只顯示收藏'}
                    </Button>
                  </div>
                </Offcanvas.Body>
              </Offcanvas>
            </>
          ) : (
            <div className="d-flex mb-3 align-items-center flex-wrap gap-2">
              <Button
                variant="outline-dark"
                className="me-3"
                onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              >
                排序： {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
              </Button>

              <Dropdown onSelect={val => setFilterLetter(val)}>
                <Dropdown.Toggle variant="outline-dark" className="btn">
                  開頭： {filterLetter || '全部'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="">全部</Dropdown.Item>
                  {alphabet.map(l => (
                    <Dropdown.Item key={l} eventKey={l}>{l}</Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown onSelect={(val) => setFrequencyFilter(val)} className="ms-3">
                <Dropdown.Toggle variant="outline-dark">
                  詞頻： {frequencyFilter ? `${frequencyFilter}★` : '全部'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="">全部</Dropdown.Item>
                  {[4, 3, 2, 1].map(n => (
                    <Dropdown.Item key={n} eventKey={n}>{`${n}★`}</Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>

              <Button
                className="ms-3"
                variant={showOnlyFavorites ? "danger" : "outline-dark"}
                onClick={() => setShowOnlyFavorites(prev => !prev)}
              >
                {showOnlyFavorites ? '顯示全部' : '只顯示收藏'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <br />
      {loading && <Spinner animation="border" variant="primary" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {Object.keys(definitions.all_results).length > 0 && (() => {
        const allWordsFlat = Object.values(definitions.all_results).flat();
        const filteredSorted = filterAndSortWords(allWordsFlat);
        return (
          <>
            <h4 className="fw-bold text-primary">全部詞條 ({filteredSorted.length})</h4>
            <ListGroup>
              {filteredSorted.map((wordData, idx) => {
                const word = wordData.defins?.[0]?.word_ch || wordData.word_ch || '';
                const key = `${word}-${idx}-${wordData.word_tayal || ''}`;

                return (
                  <WordCard
                    key={key}
                    keyName={key}
                    word={word}
                    result={wordData}
                    expandedWord={expandedWord}
                    toggleExpand={toggleExpand}
                    toggleFavorite={() => toggleFavorite(wordData.word_tayal)}
                    playAudio={playAudio}
                    isFavorited={favoriteWords.has(wordData.word_tayal)}
                  />
                );
              })}
            </ListGroup>
          </>
        );
      })()}

      {Object.keys(definitions.exact_match_results).length > 0 && (() => {

        const allWordsFlat = Object.values(definitions.exact_match_results).flat();
        const filteredSorted = filterAndSortWords(allWordsFlat);
        return (
          <>
            <h4 className="fw-bold text-success">完全匹配結果 ({filteredSorted.length})</h4>
            <ListGroup>
              {filteredSorted.map((wordData, idx) => {
                const word = wordData.defins?.[0]?.word_ch || wordData.word_ch || '';
                const key = `${word}-${idx}-${wordData.word_tayal || ''}`;
                return (
                  <WordCard
                    key={key}
                    keyName={key}
                    word={word}
                    result={wordData}
                    expandedWord={expandedWord}
                    toggleExpand={toggleExpand}
                    toggleFavorite={() => toggleFavorite(wordData.word_tayal)}
                    playAudio={playAudio}
                    isFavorited={favoriteWords.has(wordData.word_tayal)}
                  />
                );
              })}
            </ListGroup>
          </>
        );
      })()}
      <br />
      {Object.keys(definitions.fuzzy_match_results).length > 0 && (() => {

        const allWordsFlat = Object.values(definitions.fuzzy_match_results)
          .flatMap(wordGroup => Object.values(wordGroup).flat());
        const filteredSorted = filterAndSortWords(allWordsFlat);
        return (
          <>
            <h4 className="fw-bold text-warning">相關匹配結果 ({filteredSorted.length})</h4>
            <ListGroup>
              {filteredSorted.map((wordData, idx) => {
                const word = wordData.defins?.[0]?.word_ch || wordData.word_ch || '';
                const key = `${word}-${idx}-${wordData.word_tayal || ''}`;
                  
                    return (
                      <WordCard
                        key={key}
                        keyName={key}
                        word={word}
                        result={wordData}
                        expandedWord={expandedWord}
                        toggleExpand={toggleExpand}
                        toggleFavorite={() =>toggleFavorite(wordData.word_tayal)}
                        playAudio={playAudio}
                        isFavorited={favoriteWords.has(wordData.word_tayal)}
                      />
                );
              })}
            </ListGroup>
          </>
        );
      })()
      }
    </Container>
  );
};

export default App;
