// app/layout.js
import './globals.css';

export const metadata = {
  title: 'Resume Shortlister',
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header>
          <h1>AI Resume Shortlister</h1>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
