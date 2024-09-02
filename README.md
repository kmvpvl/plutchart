PLUTCHART

[Description](#description) | [How to start](#how-to-start) | [Technical details](#technical-details) | [How to contribute](#how-to-contribute)



See also [PLUTCHART.COM](https://plutchart.com)

# Description
Here is the ecosystem for psychologists, HR managers, employees, and everyones who want make their mental life better. It consists of Telegram bot, landing page with Q&A, wiki engine and tool to manage the content items.

It's based on studies of [Robert Plutchik](https://en.wikipedia.org/wiki/Robert_Plutchik)
# How to start
[Prerequisites](#prerequisites) | [API](#preparing-env-file-of-api-service) | [Tool](#preparing-env-file-of-tool-service) | Landing | Wiki
## Prerequisites
1. Create Mongo instance and create new database, e.g. PLUTCHIK
2. Create new user of Mongo with read and write rights
3. Create new Telegram bot by Telegram Bot Father and get the Telegram bot token
## Preparing .env file of API service
4. Go to *api* folder
```
cd api
``` 
5. Create new file *.env* in *api* folder
6. Add setting *mongouri* to the *.env* file. E.g. 

```mongouri = mongodb://127.0.0.1:27017/PLUTCHIK``` 

or 

```mongouri = mongodb+srv://user:password@cluster0.kwfde.mongodb.net/DBNAME?retryWrites=true&w=majority ``` 

7. Create new settings *tg_bot_authtoken* in *.env*, e.g. 

```tg_bot_authtoken = xxxxxxxx:yyyyyyyyyyyyyyyyyyyyyyyy ```

8. Create other optional parameters in *.env* 

``` 
tg_web_hook_server = https://api.domain.com
tg_web_app = https://tool.domain.com/tg
yt_API_KEY = zzzzzzzzzzzzzzzzzzzzzzzzz
help_support_staff = 12345678,87654321
tg_bot_name = TEST_PLUTCHART
landing_url = https://www.domain.com
```
* *tg_web_hook_server* - API-domain address. Used for Telegram WEB hook registration
* *tg_web_app* - URL to assess and insights. Optional
* *yt_API_KEY* - YouTube token to access to API
* *help_support_staff* - comma-separated array of Telegram IDs of support staff. Optional
* *tg_bot_name* - name of the Telegram bot. Optional
* *landing_url* - URL to landing domain
## Build and start API service
9. Optional. Build api service 
```
npm run build
```
10. Start in development mode with *nodemon*
```
npm run start:debug
```

or, if API service had built, start production mode

```
npm build start
```
11. Check whether *api* service started successfully. Awaiting response *200* and *Content: Service started successfully!*
```
curl api.domain.com
```
12. Return to home folder
```
cd ..
```
## Preparing .env file of Tool service
13. Go to *tool* folder
```
cd tool
```
14. Create *.env* file in tool folder by template below
```
REACT_APP_SERVER_BASE_URL = https://api.domain.com
REACT_APP_LANDING_PAGE = https://www.domain.com
REACT_APP_PLUTCHART_BOT_USER_NAME = plutchik_bot
REACT_APP_PLUTCHART_BOT_START_COMMAND = from_landing
REACT_APP_PLUTCHART_EDIT_CONTENT_URL = https://tool.domain.com
```

# Technical details
## Technical overview
## API
### API Types and Objects
#### RoleType
"supervisor"|"administrator"|"manage_users"|"manage_content"|"getting_match"|"assessment_request"

#### `MLString` type
Multilanguage string

#### `IEmotionVector` interface
8-dimensional vector data

Properties
Name|Type|Description|Mandatory
-|-|-|-
joy|number|Joy axis of vector|Optional
trust|number|Trust axis of vector|Optional
fear|number|Fear axis of vector|Optional
surprise|number|Surprise axis of vector|Optional
sadness|number|Sadness axis of vector|Optional
disgust|number|Disgust axis of vector|Optional
anger|number|Anger axis of vector|Optional
anticipation|number|Anticipation axis of vector|Optional
---
#### `EmotionVector` class
EmotionVector class extends the [IEmotionVector interface](#iemotionvector-interface) and has the same properties

Methods
Name|Description|Parameters|Return
-|-|-|-

#### `IUser` interface
Describes the user of system.

Properties
Name|Type|Description|Mandatory
-|-|-|-
name|string|User's name which user has chosen theirselves|Optional
tguserid|number|Telegram ID of registered user. If user left the system this property must be "-1"|Mandatory
birthdate|Date|Birthdate of user approximately or exactly|Optional
birthdateapproximately|boolean|Whether the birthdate approximately|Optional
nativelanguage|string|IETF language tag of user|Optional
secondlanguages|Array of strings|*Not implemented*|Optional
location|Object or string|Location may be string of cyty or country name, or object with long and lat with exact coordinates|Optional
gender|string|The gender of user|Optional
readytomatch|boolean|User ready to match|Optional
maritalstatus|string|*Not implemented*|Optional
features|string|*Not implemented*|Optional
assignedgroups|Array|*Deprecated. Don't use*|Optional
assignedorgs|Array|List of assigned tasks (organizations) to user|Optional
studygroup|string|*Deprecated. Don't use*|Optional
blocked|boolean|Whether user is blocked|Mandatory
auth_code_hash|string|Hash code of generated authorization code|Optional
created|Date|Date when the user was created|Mandatory
changed|Date|Date of last chnages of user's properties| Optional
awaitcommanddata|string|For some actions in telegram, e.g. assign age or name to user, this field is used for saving what the data api is waiting user types|Optional
ips|Array of strings|List of ip where user assesses content items from|Optional
support_staff|boolean|Whether user belongs to support staff of PLUTCHART|Optional
#### IParticipant interface
Properties
Name|Type|Description|Mandatory
-|-|-|-
uid|Mongoose ObjectId|[User](#iuser-interface)'s uniq _id|Mandatory
created|Date|Date when the Participant created|Mandatory
expired|Date|Expire date of Participant|Optional
roles| Array of strings|Array of [RoleType](#roletype) of Participant|Mandatory
#### `IOrganization` interface
Properties
Name|Type|Description|Mandatory
-|-|-|-
_id|Mongoose ObjectId|Uniq mongo id of organization|Optional
name|[MLString](#mlstring-type)|Mnemonic name of organization|Mandatory
participants|Array of [IParticipant](#iparticipant-interface)|List of users who can manipulate content items, users and participants|Mandatory
emails|Array of string|List of emails to recover passwords and report content items|Mandatory
invitations| Array of IInvitationToAssess|List of invitations sent to users|Optional
responses_to_invitations|Array of IResponseToInvitation|Here we save the Accepts or the Declines invitations from users|Optional
created|Date|Date when organization was created|Mandatory
changed|Date|Date of the last organization changed|Optional

#### User class
Methods
Name|Description|Parameters|Return
-|-|-|-
block|Function blocks or unblocks user|`block`: boolean, optional - default value is true| -
checkSessionToken|Function checks whether session token is valid and increase its expire date|`session_token` - Mongoose ObjectId, optional - which checking to expire, or undefined if need to create new session token<br/>`session_minutes` - number, optional - count of minutes that increased the life of token expired time, default value is 10080| new of increased session_token - Mongoose ObjectId
changeNativeLanguage|Changes native language of user|`lang` - IETF language tag string|-
setAge|Changes `birthdate` and `birthdateapproximately` fields|`age` - number|-
setGender|Changes (clears) gender of user|`gender` - string, optional - gender of user|-
setName|Sets (clears) the name of user|`name` - string, optional - name of user|-
setLocation|Sets or clears location of user|`location` - string or object, optional - city or country as a string or geoposition of user|-
noticeIP|Track ip-addresses of users who assessing content items|`ip` - string or array of strings |-
setAwaitCommandData|Sets or clears flag that new data from this user must be interpreted as exact data type|`cmd` - string or undefined|-
deleteTgUser|If user wants to leave the system and request to delete their data|-|-

### API Security schemas
All three types of security schemas are placed as apiKey in headers of Request. See details [here](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
#### Telegram query string

This schema is used in webapp only  
> plutchik-tguid: `Telegram chat id here`<br/>
> plutchik-tgquerycheckstring: `Query string from telegram.js of webapp`

#### Telegram Authorization code

This schema is used to get new session token by request authorization code. API creates authorization code and sends by Telegram bot
> plutchik-tguid: `Telegram chat id here`<br/>
> plutchik-authcode: `Auth code gotten by Telegram bot` 

#### Session token

Common security schema.
> plutchik-tguid: `Telegram chat id here`<br/>
> plutchik-sessiontoken: `Session token gotten after using auth code gotten from Telegram bot`

### API paths
Path|Method|Security schema|Description|Parameters|Return

#### GET `version`
Returns version of API, Data and AI 

Security: -

Parameters: -

Return JSON data-block as below
```json
{
    api: "1.0.0",
    data: "0.0.0",
    ai: "0.0.0"
}
```

#### GET `tgsetting`
Makes Telegram settings for bot. Sets Short description, description, commands etc.

Security: -

Parameters: -

#### POST `tggetsessiontoken`
Get new or increase expired date of session token

Security: [Authorization code](#telegram-authorization-code)

Parameters: -

Return: string, e.g. `63c12e625c80a49f1b08ad71`

#### POST `createorganization`
Creates new organization. Organization can manage set of content items, users who are assigned the set to assess. User who creates new [organization](#iorganization-interface) added to participants list with `administrator` [role](#roletype)

Security: [Session token](#session-token)

Parameters
Name|Where|Description|Mandatory
-|-|-|-
name|requestBody|Name of new organization|Mandatory
emails|requestBody|List of emails separated by comma|Optional

Return: [IOrganization](#iorganization-interface) data

#### POST `renameorganization`
#### POST `tgcreateauthcode`
#### POST `userinfo`
#### POST `orgsattachedtouser`
#### POST `getorgcontent`
#### POST `addcontent`
#### POST `addassessment`
#### POST `getnextcontentitem`
#### POST `getcontentstatistics`
#### POST `getinsights`
#### POST `reviewemotionaboveothers`
#### POST `getnextmatchcandidate`
Calculates next the most relevant match candidate and returns candidate public info, candidate non-normalized [IEmotionVector](#iemotionvector-interface) s of common-assessed content items by user and match-candidate.

Security: [Session token](#session-token) or  [Telegram query string](#telegram-query-string)

No parameters

Return: 
```js
{
    matchcandidate: IUser
    user: IUser
    vectors: {
        vector: IEmotionVector
        candidate: IEmotionVector
        delta: IEmotionVector
    }
}
```


#### POST `skipmatchcandidate`
Adds candidate to skip list and calculates next the most relevant match candidate and returns candidate public info, candidate non-normalized [IEmotionVector](#iemotionvector-interface) s of common-assessed content items by user and match-candidate.

Security: [Session token](#session-token) or  [Telegram query string](#telegram-query-string)

Parameters
Name|Where|Description|Mandatory
-|-|-|-
candidateid|requestBody|Uid of candidate-user|Mandatory

Return next match candidate as [getnextmatchcandidate](#post-getnextmatchcandidate)

#### POST `likematchcandidate`
Adds candidate to like list and calculates next the most relevant match candidate and returns candidate public info, candidate non-normalized [IEmotionVector](#iemotionvector-interface) s of common-assessed content items by user and match-candidate.

Security: [Session token](#session-token) or  [Telegram query string](#telegram-query-string)

Parameters
Name|Where|Description|Mandatory
-|-|-|-
candidateid|requestBody|Uid of candidate-user|Mandatory

Return next match candidate as [getnextmatchcandidate](#post-getnextmatchcandidate)
#### POST `setmatchoptions`
Resets of changes user's match options.

Security: [Session token](#session-token) or  [Telegram query string](#telegram-query-string)

Parameters
Name|Where|Description|Mandatory
-|-|-|-
resetall|requestBody|boolean. if true reset all settings before set|Optional
clearskippedlist|requestBody|boolean. Clears skipped candidates list|Optional
clearlikedlist|requestBody|boolean. Clears liked candidates list|Optional
readytomatch|requestBody|boolean. Set or clear desire of user to be match candidate. Otherwords, is user ready to match|Optional
lookingfor|requestBody|Object. filters to search candidates|Optional
|||gender: string - which gender searching for. Its properties are:|Optional
|||birthdateFrom:string - The low edge of age for searching|Optional
|||birthdateTo: string - The high edge of age for searching|Optional
|||atLeastAssessmentsCount: number - The low edge of count of any assessments candidate has|Optional
|||commonAssessedContentItems: number - The low edge of count of common assessments|Optional
|||locationDistance: number - The maximal distance in meters|Optional
|||language: string - Language of candidate|Optional

Returns: nothing

#### POST `getmatchlist`
#### POST `getusersassessedorganizationcontent`
#### POST `reminduseraboutinvitation`
#### POST `requesttoassignorgtouser`
#### POST `getinvitationstats`
#### POST `getorganizationstats`
#### POST `supportusersrating`
#### POST `supportuserstats`
#### POST `supportsendmessagetouser`
## Tool
## Landing
## WIKI
# How to contribute