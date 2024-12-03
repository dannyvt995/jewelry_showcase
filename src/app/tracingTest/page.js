"use client"
import {useEffect} from 'react'
import * as THREE from 'three'
export default function page() {
  
  return (
    <div>
       <div id="container"> </div>
		<div id="info">three.js PathTracing Renderer - Geometry Showcase</div>
		
		<div id="cameraInfo" style="position:fixed; left:3%; bottom:2%; font-family:arial; color:rgb(255,255,255);"></div>

    </div>
  )
}
