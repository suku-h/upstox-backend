Step 1: Git clone the repositor

Step 2: Launch mongodb on port 27017

Step 3: Create database named `upstox`

Step 4: cd into the folder and run `yarn install`

Step 5: Run `yarn start`. Server will start on port 3000

Step 6: Open postman and test the apis

Step 7: List of apis, their url and parameters

  a. addCustomer 
     Method: POST
     URL: localhost:3000/customer
     Parameters: email, referral_id (optional)
     Sample: {
	              "email": "email@upstox.com"
              }
     
  b. getCustomer
     Method: GET
     URL: localhost:3000/customer
     Parameters: customer_id
     Sample: localhost:3000/customer?customer_id=341194641899

  c. addReferral
     Method: PUT
     URL: localhost:3000/customer/referral
     Parameters: customer_id, referral_id
     Sample: {
                "customer_id": "466134368114",
                "referral_id": "341194641899"
              }

  d. fetchAllChildren
     Method: GET
     URL: localhost:3000/customer/children
     Parameters: customer_id
     Sample: localhost:3000/customer/children?customer_id=341194641899

  e. addAmbassador
     Method: POST
     URL: localhost:3000/customer/ambassador
     Parameters: email
     Sample: {
	              "email": "ambassador@upstox.com"
              }  

  f. fetchAllCustomersWithReferralCount
     Method: GET
     URL: localhost:3000/customer/referral/count    
     Sample: localhost:3000/customer/referral/count

  g. convertCustomerToAmbassador
     Method: PUT
     URL: localhost:3000/customer/ambassador
     Parameters: customer_id
     Sample: {
                "customer_id": "466134368114"
              }   

  h. fetchAllAmbassadorChildren
     Method: GET
     URL: localhost:3000/customer/ambassador/children
     Parameters: customer_id
     Sample: localhost:3000/customer/ambassador/children?customer_id=466134368114

  i. fetchChildrenAtNthLevel
     Method: GET
     URL: localhost:3000/customer/ambassador/children/level
     Parameters: customer_id, level
     Sample: localhost:3000/customer/ambassador/children/level?customer_id=466134368114&level=2