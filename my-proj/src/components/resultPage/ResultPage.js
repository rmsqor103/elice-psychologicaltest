import React, {useEffect, useState} from 'react';
import { useInformState, useInformDispatch} from '../InformProvider'
import { useHistory } from "react-router-dom";
import axios from 'axios';
import ErrorPage from '../etcPage/ErrorPage';
import LoadingPage from '../etcPage/LoadingPage';
import { apiKey } from '../../data/data';
import { questionInfo } from '../../data/data';

const ResultPage = () => {
  const state = useInformState();
  const dispatch = useInformDispatch();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const result = state.answers.reduce((acc, cur, idx) => {
    return acc + `B${idx+1}=${cur} `;
  }, '');

  useEffect(() => { 
    if((state.answers.length === 0 || state.answers.includes('0'))){
      return <ErrorPage/>
    }
    try {
      (async function() {
        const date = new Date();
        const param = {
          "apikey": apiKey,
          "qestrnSeq": "6",
          "trgetSe": "100209",
          "name": state.user.name,
          "gender": state.user.gender === "man" ? "100323" : "100324",
          "startDtm": date.getTime(),
          "answers": result,
        }
        
        const url = `http://www.career.go.kr/inspct/openapi/test/report?apikey=${apiKey}&qestrnSeq=6`
        const res = await axios.post(url, param, {headers: {
          "Content-Type": "application/json"
        }})
  
        const seq = res.data.RESULT.url.split('=')[1];
        const scoreUrl = `https://www.career.go.kr/inspct/api/psycho/report?seq=${seq}`;

        const scoreRes = await axios.get(scoreUrl, {headers: {
          "Content-Type": "application/json"
        }})

        const score = scoreRes.data.result.wonScore.split(' ').filter(el=>el);
        const scores = score.map(s => {
          s = s.split("=");
          return {"no": s[0], "type": questionInfo[s[0]], "count": s[1]}
        })

        const sortedScore = [...scores].sort((a, b) => a.count - b.count)
        dispatch({
          type: "ADD_RESULT",
          scores: scores,
          sortedScores: sortedScore
        })

        setLoading(false);
      })();
    } catch(e){
      setError(true);
    }
  }, [])
  
  if((state.answers.length === 0 || state.answers.includes('0'))){
    return <ErrorPage />
  }

  if(loading) return <LoadingPage />
  else if(error) return <ErrorPage />

  return (
    <>
      <div className="wrapper">
        <div className="box-wrapper">
          <h1>검사가 완료되었습니다.</h1>
          <div className="result-message">직업생활과 관련하여 {`${state.user.name}`}님은 <span className="emphasis">{`${state.fin.most[0].type}`}</span>(와)과 <span className="emphasis">{`${state.fin.most[1].type}`}</span>(을)를 가장 중요하게 생각합니다.
          <br />반면에 {`${state.fin.worst[0].type}`}, {`${state.fin.worst[1].type}`}은 상대적으로 덜 중요하게 생각합니다.</div>

          <div className="btn-container">
            <button onClick={() => {
              history.push('/resultTablePage');
            }} className="btn">결과보기</button>
          </div>

        </div>
      </div>
    </>
  )
}
export default ResultPage