"use client"
import ListSample from "./components/ListSample";
import { useLoadTextures } from '../app/hooks/loadAssets';
import { useEffect } from "react";
export default function Home() {
  console.log("Homne")
  useLoadTextures();
 
  return (
    <>
   {/*  <p className={{display:"none"}}>https://codesandbox.io/p/sandbox/twilight-browser-7235jd?file=%2Fsrc%2FEffectComposer.tsx%3A43%2C1-44%2C1</p> */}
    <ListSample/>
    </>

  )
}
