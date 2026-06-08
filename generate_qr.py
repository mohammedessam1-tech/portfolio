import qrcode

url = 'https://mohammedessam1.github.io/'
img = qrcode.make(url)
img.save('qr-code.png')
print('saved qr-code.png')
