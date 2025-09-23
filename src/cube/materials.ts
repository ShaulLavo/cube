import * as THREE from 'three'
import type { ColorRepresentation } from 'three'
import { cubeSize } from './constants'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const innerPlastic = new THREE.MeshPhysicalMaterial({
	color: 0x0a0a0a,
	roughness: 1.0,
	metalness: 0.0,
	clearcoat: 0.0,
	clearcoatRoughness: 1.0
})
innerPlastic.envMapIntensity = 0.0

function glossySticker(color: number) {
	const m = new THREE.MeshPhysicalMaterial({
		color,
		roughness: 0.18,
		metalness: 0.1,
		clearcoat: 1.0,
		clearcoatRoughness: 0.08,
		transparent: true,
		side: THREE.FrontSide
	})
	m.envMapIntensity = 1.6
	return m
}

const matWhite = glossySticker(0xffffff)
const matYellow = glossySticker(0xffd500)
const matRed = glossySticker(0xc41e3a)
const matOrange = glossySticker(0xff8f00)
const matBlue = glossySticker(0x0051ba)
const matGreen = glossySticker(0x009e60)

// Order: [right, left, top, bottom, front, back]
export function materialsFor(i: number, j: number, k: number) {
	const right = i === 1 ? matRed : innerPlastic
	const left = i === -1 ? matOrange : innerPlastic
	const top = j === 1 ? matWhite : innerPlastic
	const bottom = j === -1 ? matYellow : innerPlastic
	const front = k === 1 ? matGreen : innerPlastic
	const back = k === -1 ? matBlue : innerPlastic
	return [right, left, top, bottom, front, back]
}

const cornerRadius = Math.min(0.12, cubeSize * 0.8)
const cornerSegments = 1
export const cubeletGeometry = new RoundedBoxGeometry(
	cubeSize,
	cubeSize,
	cubeSize,
	cornerSegments,
	cornerRadius
)

// Set every material on the cube to the same color while preserving
// roughness/metalness/clearcoat and other effects.
export function setCubeColor(color: ColorRepresentation) {
	innerPlastic.color.set(color)
	matWhite.color.set(color)
	matYellow.color.set(color)
	matRed.color.set(color)
	matOrange.color.set(color)
	matBlue.color.set(color)
	matGreen.color.set(color)
}
