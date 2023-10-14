import './globals.css';

export const metadata = {
  title: 'Schmek',
  description: 'A simple snake game with abilities',
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				<script src="./scripts/before-load.js" async/>
			</head>
			
			<body>
				{children}
			</body>
		</html>
	);
};
