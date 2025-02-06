# Testing Plan

## Testing Strategy
- **Unit Tests**: Test individual components (e.g., compliance check).


## Test Cases

Test Specification ID: T001-0402-2025 

Name of Tester           : Ke Yincheng 

Use Case ID                : ComplyZense 

Date of Test                : 4th February 2025 

Description of Test: Test 1 of whole system 

#### Create Account/Log In Account 

Test Case 

To register for a new account, and log in with said account 

Expected Result 

Account creation successfully registers, and successfully log on 

Pass/ Fail 

Pass 

Remarks 

Works as planned 


#### Chat Message 

Test Case 

To test if AI can return chat message results after processing user chat requests 

Expected Result 

To reply with high quality answers

Pass/ Fail 

Pass 

Remarks

Chatbot does not answer questions out of scope, as intended
Answer returned are of good quality 

#### Upload File (No Report Generation) 

Test Case

To test if AI can read files and return appropriate replies. 
  
Expected Result

Results should either directly answer questions coupled with the file, or within the file 

Pass/ Fail 

Pass 

Remarks 

Works very well on every instance of file tested 

#### Upload File (With Report Generation) 

Test Case

To test if AI can return a report of good quality 

Expected Result

To generate a report of good quality, able to distinguish good policies and bad policies 

Pass/ Fail

Pass 

Remarks

Chatbot brings up both good and bad points, provides recommendation and breaks down each point in provided policies 

#### Session and History Manipulation 

Test Case

To test if functions, Filter, Delete or Export Sessions work 

Expected Result

Filter should isolate sessions, Delete should delete all sessions but current, Export exports chat history of selected sessions 

Pass/ Fail

Pass 

Remarks

Works very well, Delete will not work if only one current active session 

Filter works fine 

Export can read file contents in the exported file. 


#### Logout and Delete Account 

Test Case

To test if account can be logged out of, and deleted 

Expected Result

Both functions to work 

Pass/ Fail

Pass 

Remarks

Logout works 

Delete account works 

