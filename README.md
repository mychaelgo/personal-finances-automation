# Table of contents

- [Table of contents](#table-of-contents)
  - [Personal finances automation](#personal-finances-automation)
  - [Background](#background)
  - [Tools \& Application](#tools--application)
    - [Google sheets](#google-sheets)
    - [Pipedream](#pipedream)
    - [Telegram](#telegram)
  - [Scripts \& library](#scripts--library)
    - [BCA eStatement parser](#bca-estatement-parser)
    - [BCA mobile banking](#bca-mobile-banking)
    - [Gojek](#gojek)
    - [Tokopedia](#tokopedia)
    - [Shopee](#shopee)
    - [SimInvest](#siminvest)
    - [SPOT Sucor](#spot-sucor)

## Personal finances automation

In this repo i will list down what i use to automate my finances. It can be existing tools or the script/library i build that can be useful to get transaction information.

## Background

Managing money can be a source of stress and taking a lot of time.
I have some some bills to pay, like utility, credit card, insurance, etc.
Because i want to track my expenses as well, i want to all "money out" from my pocket to be recorded in one single source.
Imagine how long it takes to record the transaction you have in the past month into 1 single source like Google Sheets? 🤔
So i think it worth to automate & list it down in here in case you also interested.

## Tools & Application

### Google sheets

Link: <https://www.google.com/sheets/about/>
This is i used for source of transaction i made from various application/channels such as Bank, eWallet, eCommerce, etc
  
### Pipedream

Link: <https://pipedream.com/>
Pipedream to connect multiple application/scripts/library i built with API. Thinking it by connecting the dots. Example use case: I want to record my eCommerce transaction daily ➡️ save it to Google Sheets ➡️ Notify me to Telegram if success

### Telegram

Link: <https://telegram.org/>
Used for notify if transaction successfully recorded or failed

## Scripts & library

List of existing or my custom build library to support my needs for personal finances automation.

### BCA eStatement parser

Link: WIP
Script to parse eStatement & credit card statement from PDF into JSON

### BCA mobile banking

Link: WIP
Library to automate transfer using BCA mobile apps

### Gojek

Link: <https://github.com/mychaelgo/gojek>
This library i used to get transaction history from GoPay transaction to Gojek core services like GoFood and GoRide

### Tokopedia

Link: WIP

This library i used to get my transaction history in [Tokopedia](https://www.tokopedia.com/) from eCommerce to bills payment

### Shopee

Link: WIP

This library i used to get my transaction history in [Shopee](https://shopee.co.id/) and also ShopeFood

### SimInvest

Link: WIP

Library for automatic investment using [SimInvest](https://www.siminvest.id/)

### SPOT Sucor

Link: WIP

Library for automatic investment using [SPOT Sucor](https://spot.sucorsekuritas.com/)
