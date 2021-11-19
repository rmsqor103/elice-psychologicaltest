import Header from './Header';
import { useInformState } from './InformProvider'
import React, {useEffect, useState} from 'react';
import { useHistory, useParams } from "react-router-dom";
import BtnBox from './BtnBox';
import QuestionBox from './QuestionBox';

const TestPage = () => {
  const state = useInformState();
  const { id } = useParams();
  const history = useHistory();

  function getRatio() {
    const zeroCount = state.answers.reduce((acc, cur) => {
      return cur !== '0' ? acc + 1 : acc ;
    }, 0) 
    return parseInt(zeroCount / state.answers.length * 100) ;
  }

  function barMove(prev, cur) {
    const now = document.getElementById('now-bar');
    let width = parseInt(prev);
    const oper = setInterval(move, 20);
    function move(){
      if(width >= cur){
        clearInterval(oper);
      } else {
        width++;
        now.style.width = width + '%';
      }
    }
  }

  const [ratio, setRatio] = useState(
    getRatio()
  )

  useEffect(() => {
    const prevRatio = parseInt(ratio)
    setRatio(() => {
      return getRatio();
    })
    barMove(prevRatio, getRatio())
  }, [state])

  if(state.answers.length === 0){
    history.push('/')
  }
  return (
    <div className='wrapper'>
      <div className="box-wrapper">
        <Header text="검사진행" progress={ratio}/>
        {state.question.slice(id*3, id*3+3).map((question, idx) => {
          return (
            <QuestionBox q={question} pnum={id} qnum={idx} key={Number(id) * 3 + Number(idx)}/>
          )
        })}
        <BtnBox pnum={id} totalPage={state.question.length}/>
      </div>
    </div>
  )
}

export default TestPage;