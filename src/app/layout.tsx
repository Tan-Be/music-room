export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <title>Music Room</title>
        <meta name="description" content="Совместное прослушивание музыки" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#0f0f23',
        minHeight: '100vh',
        color: '#e2e8f0'
      }}>
        {children}
      </body>
    </html>
  )
}