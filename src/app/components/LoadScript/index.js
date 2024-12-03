"use client"
import { useLoadTextures } from '../../hooks/loadAssets';
export default function LoadScript() {
    console.log("==> Load hooks ...")
     useLoadTextures();
  return (
    null
  )
}
