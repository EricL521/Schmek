// a text box, that also functions as a slider
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import styles from './slider-text-box.module.css';

export default function SliderTextBox({ label, value, onValue, min, max, step }) {
	const div = useRef(null);
	const input = useRef(null);
	const [localValue, setLocalValue] = useState(value);
	const [dragging, setDragging] = useState(false);
	const [inputSelected, setInputSelected] = useState(false);

	const mouseCSS = useMemo(() => ({
		cursor: inputSelected? 'text': 'ew-resize',
	}), [inputSelected]);

	// update input value when value changes
	const onRawValue = useCallback((value) => {
		setLocalValue(value);
		let newValue = Math.max(min, Math.min(max, parseFloat(value)));
		if (isNaN(newValue)) return;
		onValue(newValue);
	}, [min, max, onValue]);

	// deal with scrolling and selecting input
	const selectInput = useCallback(() => {
		// if input is already focused, do nothing
		if (inputSelected) return;

		input.current.focus();
		input.current.select();
	}, [inputSelected]);
	const onInputBlur = useCallback(() => {
		setInputSelected(false);
		setLocalValue(value);
	}, [value]);
	const startDrag = useCallback((e) => {
		// if input is already focused, do nothing
		if (inputSelected) return;

		// prevent focus
		e.preventDefault();
		// focus onto div
		div.current.focus();
		// set dragging
		setDragging(true);
	}, [inputSelected]);
	const stopDrag = useCallback(() => {
		// deselect div
		div.current.blur();
		setDragging(false);
	}, []);
	const onDrag = useCallback((e) => {
		// if left mouse is not down or input is selected, remove listener
		if (e.buttons !== 1 || inputSelected)
			return stopDrag();
		
		// get change in value
		const dx = e.movementX;
		const percent = dx / div.current.offsetWidth;
		const dValue = percent * (max - min);
		// add it to the current value
		let newValue = value + dValue;
		// round to nearest step
		if (step) newValue = Math.round(newValue / step) * step;
		// clamp to min and max
		newValue = Math.max(min, Math.min(max, newValue));

		// set value
		onRawValue(newValue);
	}, [min, max, step, value, inputSelected, onRawValue, stopDrag]); 

	return (
		<div style={mouseCSS} className={[styles['slider-text-box'], styles['interactive']].join(' ')} ref={div} tabIndex={-1}
			onMouseUp={stopDrag} onMouseDown={startDrag} onMouseMove={onDrag} >
			<input id={styles['slider-text-input']} className={styles['interactive']} ref={input} 
				value={localValue} onChange={e => onRawValue(e.target.value)} onClick={selectInput}
				onFocus={() => setInputSelected(true)} onBlur={onInputBlur}
				onKeyDown={ e => {if (e.key === "Enter") { input.current.blur(); onInputBlur(); }} }/>
			<label htmlFor={styles && styles['slider-text-input']}>
				{label}
			</label>

			<div id={styles && styles['screen-overlay']} className={!dragging ? styles['hidden']: ""}  />
		</div>
	);
};