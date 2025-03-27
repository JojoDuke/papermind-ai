import requests

url = "https://api.wetrocloud.com/v1/collection/query/"
headers = {
        "Authorization": "Token wtc-sk-ff86dcf1bdf90981a679044600396edfab43bf01"
    }

data = {
    "collection_id": "test4",
    "request_query": "Were there any fees or anything",
    "model": "gpt-4o"
}


response = requests.post(url, data=data, headers=headers)
print(response.text)