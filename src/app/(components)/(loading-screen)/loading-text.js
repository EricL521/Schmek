'use client';

import { useEffect, useState } from "react";

import style from "./loading-text.module.css";

export default function LoadingText({text}) {
	// animate loading dot
	const dotSpacingValues = [0, 0.5, 1]; // loops through these values
	const [dotSpacing, setDotSpacing] = useState(0);
	useEffect(() => {
		// set timeout to change dot spacing, in one second
		const timeout = setTimeout(() => {
			setDotSpacing((dotSpacing + 1) % dotSpacingValues.length);
		}, 1000);
		return () => clearTimeout(timeout);
	});

	return (
		<h1 className={style["interactive"]}>
			{text}&nbsp;
			<span className={style['dot-spacing']} style={{width: dotSpacingValues[dotSpacing] + "em"}}/>
			.
			<span className={style['dot-spacing']} style={{width: dotSpacingValues[dotSpacingValues.length - dotSpacing - 1] + "em"}}/>
		</h1>
	);
};