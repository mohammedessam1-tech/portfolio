import qrcode

url = 'https://mohammedessam1-tech.github.io/portfolio/'
img = qrcode.make(url)
img.save('qr-code-live.png')
print('saved qr-code-live.png')
