# url-shortener-microservice
## Create a Short URL
Allows you to create a new Short URL\
`POST /urls`
### Request
#### Path Parameters
None
#### Request Body
Required
#### Request Body Format
JSON
#### Request JSON Attributes
| Name        | Description                         | Required? |
| ----------- | ----------------------------------- | --------- |
| url         | URL to Shorten.                     | Yes       |
#### Request body example
```
{
  "url": "https://canvas.oregonstate.edu/groups/463846/discussion_topics/9626874"
}
```
### Response
#### Response Body Format
JSON
#### Response Statuses
| Outcome    | Status Code                         | Notes                                                                                                                                                                                                    |
| ---------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Successful | 201 Created                         |                                                                                                                                                                                                          |
| Failure    | 415 Unsupported Media Type          | If the client sent a MIME type other than ‘application/json’.                                                                                                                                            |  
| Failure    | 406 Not Acceptable                  | If the client accepts a MIME type other than ‘application/json’.                                                                                                                                         |
| Failure    | 400 Bad Request                     | If the request is missing any required attributes.<br />If the url is not a valid http/https URL. |
#### Response Examples
##### Success
```
Status: 201 Created

{
  "short_url": "<protocol>:<hostname>/a1b2c3",
  "url": "https://canvas.oregonstate.edu/groups/463846/discussion_topics/9626874"
}
```
##### Failure
```
Status: 415 Unsupported Media Type

{
    "Error": "Unsupported media type: 'text/html'. Payload must be 'application/json'."
}
```
```
Status: 406 Not Acceptable

{
    "Error": "Unsupported 'Accept' header: 'text/html'. Must accept 'application/json'."
}
```
```
Status: 400 Bad Request

{
    "Error": "Bad value for payload attribute: 'URL'. Cause: 'Invalid URL'."
}
```
## Get long URL
Redirects to a long URL\
`GET /:key`
### Request
#### Path Parameters
None
#### Request Body
None\
Note: due to CORS, most servers will reject the subsequent asynchronous GET request.
### Response
#### Response Body Format
##### Success
None
##### Failure
JSON
#### Response Statuses
| Outcome    | Status Code                         | Notes                |
| ---------- | ----------------------------------- | -------------------- |
| Successful | 301 Moved Permanently               |                      |
| Failure    | 404 Not Found                       | If key is not found. |  
#### Response Examples
##### Success
```
301 Moved Permanently

No Content
```
##### Failure
```
Status: 404 Unsupported Media Type

{
    "Error": "The requested resource could not be found."
}
```
