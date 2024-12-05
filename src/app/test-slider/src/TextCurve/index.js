import gsap from 'gsap';
import React from 'react';
import SplitType from 'split-type'
import useTimelineStore from '../store/useStoreTimeline'
const TextCurve = ({ children,id }) => {
    const {timelinesTextCruve,addTimeline} = useTimelineStore()
   
    const refContent = React.useRef()
    const refSplitContent = React.useRef()
    const rangeSample = React.useRef({ min: null, max: null })
    const unitRot = React.useRef([])
    React.useEffect(() => {
        console.log("timelines",timelinesTextCruve)
        if (refContent.current) {
            refSplitContent.current = new SplitType(refContent.current, { types: 'chars' });
            refSplitContent.current.chars.forEach((char, index) => {
                //calc margin rot
                let target = ((char.offsetWidth / 100) + 14.2) * 0 + 15 * 1
                // const charHeight = char.offsetHeight;
                // const parentHeight = char.parentElement.offsetHeight;
                // const perTarget = (charHeight / parentHeight) * 100;
            
            
                let unitrot = (target * index)
                // sum textrot must be small than 180
                // get range rot
                if (index === 0) {
                    rangeSample.current.min = unitrot
                }
                if (index === refSplitContent.current.chars.length - 1) {
                    rangeSample.current.max = unitrot
                }
                unitRot.current.push(unitrot)

            })

            let targetTypeShow = -rangeSample.current.max/2
            let targetTypeHidden = targetTypeShow + 180

            refSplitContent.current.chars.forEach((char, index) => {

                //set props static
                char.classList.add(`active1`);
                //char.style.zIndex = `999`
                char.style.border = `1px solid gray`
                char.style.transformOrigin = `bottom center`
                char.style.width = `inherit`
                // char.style.width = `100px`
                const heightNeed = 80
                char.style.height = `${heightNeed}%`
                char.style.left = `50%`
                char.style.top = `50%`

     
                //apply
                char.style.transform = `translate(-50%, -100%)`
              //  char.style.transform = `translate(-50%, -100%) rotate(${unitRot.current[index] + targetTypeShow}deg)`;
            });

            gsap.set(refSplitContent.current.chars, {
               rotate: `180`
              // rotate: (index) => `${unitRot.current[index] + targetTypeHidden} `, 
            })
            const timelineon = gsap.timeline({paused:true,overwrite:true}).to(refSplitContent.current.chars, {
                stagger: 0,
               rotate: (index) => `${unitRot.current[index] + targetTypeShow}`, 
                duration: 1, 
            })
            const timelineoff = gsap.timeline({paused:true,overwrite:true}).to(refSplitContent.current.chars, {
                stagger: 0,
               rotate: (index) => `${unitRot.current[index] + targetTypeShow  - 180}`, 
                duration: 1, 
            });
            addTimeline(`timelineTextCruve_${id}`, timelineon, 'on');
            addTimeline(`timelineTextCruve_${id}`, timelineoff, 'off');
        }

        return () => {
            if (refContent.current) {
                refContent.current.innerHTML = '?????????????';
            }
            if (refSplitContent.current) refSplitContent.current = null
        };
    }, []);


    React.useEffect(() => {
        console.log("timelines",timelinesTextCruve)
  
    }, [timelinesTextCruve])
    
    return (
        <>
            {React.cloneElement(children, { ...{ ref: refContent } })}
        </>
    )
}


export default TextCurve