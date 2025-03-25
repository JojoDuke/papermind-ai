import requests

url = "https://api.wetrocloud.com/v1/collection/query/"
headers = {
        "Authorization": "Token wtc-sk-ff86dcf1bdf90981a679044600396edfab43bf01"
    }

data = {
    "collection_id": "aaee4fe7-ef30-462b-a932-d8b1e74a389f",
    "request_query": "Tell me everything you see in this document",
    "model": "gpt-4o"
}


response = requests.post(url, data=data, headers=headers)
print(response.text)