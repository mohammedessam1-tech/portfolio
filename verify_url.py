import urllib.request

def check(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            print('status', response.status)
            print('final_url', response.geturl())
            content = response.read(200).decode('utf-8', errors='replace')
            print('content_snippet')
            print(content)
    except Exception as e:
        print('error', repr(e))

if __name__ == '__main__':
    check('https://mohammedessam1-tech.github.io/portfolio/')
