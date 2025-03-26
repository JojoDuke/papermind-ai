import requests

url = "https://api.wetrocloud.com/v1/resource/insert/"
headers = {
        "Authorization": "Token wtc-sk-ff86dcf1bdf90981a679044600396edfab43bf01"
    }

data = {
    "collection_id": "test4",
    "resource": "https://res.cloudinary.com/dtolochpp/image/upload/v1742988113/namecheap-order-97954665_psrpri.pdf",
    "type":"file"
}


response = requests.post(url, data=data, headers=headers)
print(response.text)

