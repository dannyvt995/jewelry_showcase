"use client"
import React from 'react'
import s from './style.module.css'
import TextCurve from '../TextCurve'
import useTimelineStore from '../store/useStoreTimeline'


const dataSlider = [
  {name:"Charisgod"},
  {name:"godCharis"},
  {name:"Charisgodd"},
  {name:"risCharis"},
]
export default function ModuleSlider() {
  const{getTimelineByKey} = useTimelineStore()
  let count = -1
  let lastid
  const handleFireSlider = (e) => {

    count++
    if(count > dataSlider.length - 1) count = 0

    if(lastid) {
 
      let tlin =  getTimelineByKey(`timelineTextCruve_${count+123}`, 'on');

      let tlout =  getTimelineByKey(lastid, 'off');

     
      tlout.restart().play()
      tlin.restart().play()
      lastid = `timelineTextCruve_${count+123}`
    }else{
      console.log("just 1 time")
      let tlin =  getTimelineByKey(`timelineTextCruve_${count+123}`, 'on');
      tlin.restart().play()
      lastid = `timelineTextCruve_${count+123}`
    }
  
  }
  return (
    <section className={s.module}>
      <div className={s.heroSlider}>

        <div className={s.part1}>
          <div className={s.text}>
            {dataSlider.map((item,index) => (
              <TextCurve key={index} id={index+123}><h1>{item.name}</h1></TextCurve>
            ))}
           
          </div>
          <div className={s.img}></div>
        </div>

        <div className={s.part2}>
          <button className={s.buttonNext} onClick={handleFireSlider}>Let next</button>
        </div>
      </div>
       

    </section>
  )
}
