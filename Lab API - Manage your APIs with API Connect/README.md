![](./images/apic_banner-mini.png)

# Introduction

In this lab, you’ll gain a high level understanding of the architecture, features, and development concepts related to the IBM API Connect (APIC) solution. Throughout the lab, you’ll get a chance to use the APIC command line interface for creating LoopBack applications, the intuitive Web-based user interface, and explore the various aspects associated with solution’s configuration of RESTful based services as well as their operation.

>**Note**:
This lab is based on version 5.0.7 It will be updated as much as possible to follow the new versions of API Connect. Many new features have been announced at InterConnect 2017. [Statement of directions - 2017 March 14th](https://www-01.ibm.com/common/ssi/ShowDoc.wss?docURL=/common/ssi/rep_ca/2/897/ENUS217-152/index.html&lang=en&request_locale=en#abstrx).


# Objective

In the following lab, you will learn:

+ Goals of API Connect, main use cases (Presentation)
+ Basics on the architecture of the API Connect and terminology useful with API Connect (Presentation)
+ Installation (Presentation)
+ How to create and test a REST API definition (Lab)
+ How to publish an API to Bluemix (Lab)
+ How to subscribe to an API previously published and test in the portal (Lab)
+ How to create a simple LoopBack application to implement Microservice architecture (Lab)
+ How to version an API and deploy another version of an API (Lab)
+ How to create and manage a SOAP API (Lab)
+ Basics about the command line apic to script recurring operations (Lab)
+ Transformation JSON to SOAP (Lab)
+ API security (pres)


# Pre-Requisites
+ Sign in to [Bluemix](https://bluemix.net) and set up your IBM ID
+ Install IBM Node SDK 6.x [Node.js](https://developer.ibm.com/node/sdk/v6/)
+ Install (or Update) API Connect Toolkit [API Connect Developer Toolkit](https://www.npmjs.com/package/apiconnect) by issuing the following command:

   ```
   npm install -g apiconnect --no-optional --ignore-scripts
   ```
You must have version 5.0.7 or above. check the version with the following command :

  ```
   $apic -v
   API Connect: v5.0.7 (apiconnect: v2.5.22)
   ```

>**Note**:
To check all available versions of API Connect: ```npm view apiconnect version```
To check the local version of API Connect: ```apic -v```

# Goals of API Connect, main use cases
This chapter does not intend to describe all the possible use cases of API Connect, but instead provide some simple and concrete common usages of API Connect.

1. **Use case 1**: I have existing internal SOAP services and/or REST APIs. I want to expose and increase visibility internaly and externaly. I need to understand how my APIs/Services are used and apply quotas. I need to provide to secure the access.
<br><span style="text-decoration: underline;">Solution</span>: Simple proxyfication, not complex policies, use OOTB portal, manager.
2. **Use case 2**: All the above + my APIs/services do not have the right granularity or the right format to be used by my Apps.
<br><span style="text-decoration: underline;">Solution</span>: Use map policies to adapt the interfaces, and/or use JSON <-> XML policies.
3. **Use case 3**: I organise an hackathon or I'm in context of co-creation with extended eco-system and I need to rapidly create APIs from data sources or from models.
<br><span style="text-decoration: underline;">Solution</span>: Create Loopback Applications and expose them as APIs.
4. **Use case 4**: I need some kind of composition/aggration and expose an API.
<br><span style="text-decoration: underline;">Solution</span>: Create a Loopback Application and add remote hook

# Architecture and terminology
## API Connect architecture onPremise
The main components composing API Connect are:
+ The **Gateway** (either DataPower, either a NodeJS implementation called micro gateway in this case). The requests from apps are going through the gateway, policies are enforced and analytic are gathered.
+ The **Manager**  where the APIs are defined and governed. It also collects the analytics from the gateway. The manager can be used directly or more likely using the toolkit.
+ The **Portal**, an open source Drupal CMS - Content Management System. For the API consumers (Apps developpers), they create Apps and susbscribe to API within the portal. Based on Drupal, it is highly customizable.
+ The **Collective member** or micro servics runtime. This is where the loopback applications are running. This component is originaly coming from StrongLoop acquisition. Loopback applications can be created in minutes to expose data from SQL or NoSQL database and aslo a good place to perform composition of APIs.
+ Associated to the collective member is the **Collective controller** that monitors the collective member and can provide advanced feature such as auto-scaling.
+ The **Toolkit**, running on the API developper, it offers the same web experience as the manager to manage APIs. But this is also the only place where you can define Loopback applications. It also contains CLI to operate directly on the manager wether it is an onPremise version or Bluemix version of API Connect.

>Below a sample of deployment of API Connect on premise. System API is a generic term to define an API implementation, for example running in WAS Liberty (JAX-RS) or an API exposed on another layer such as an ESB.
![APIC Achitecture](./images/apic-archi-on-prem.png)

## API Connect architecture in Bluemix
Well, API Connect in Bluemix, is the same product as onPremise (or almost, notice the NodeJS runtime instead of collective member). This gives us a competitive advantage, because we have no issues at all to move from onPremise to Bluemix and vice-versa.

>Notice the **secure gateway** component that allows to connect simply IBM Bluemix and the company IT.
![APIC Achitecture in Bluemix](./images/apic-archi-bmx.png)

## Terminology
+ An **API**: Can be SOAP or Representational State Transfer - REST API defined with an Open API definition (Swagger) as a YAML file. One API = one yaml file though WSDLs and Schema are separated in a zip file for a SOAP API.
+ A **Plan**: this is where we specify the quotas and if an approval is needed to subscribe to a Product/API.
+ A **Product**: this is an aggregation of APIs, and one or many plans associated to those APIs. This is what is published to a catalog. One Product = one yaml file.
+ A **Catalog**: it's relates to a cluster of gateways and a portal. It sounds like an environment but it also contains a business dimension. For example, good names for a catalog are Sandbox, Dev, Production, CRM (for my CRM APIs exposed to a specific population), etc ...
+ An API Connect **Cloud**: not to be confused with a cloud infrastructure/platform, it is a combination of gateways clusters, managers cluster, portal clusters and collective runtimes. Usually a customer will have one, two, sometime three or more API Connect clouds, based on its organisation and needs to separate the infrastructures.
+ **Assembly panel**: this is where we specify the policies to be executed in the gateway for each transactions.

## Concepts map
![APIC Concepts](./images/apic-ConceptsMap.png)

Below the available policies in API Connect 5.0.6


|Category  | Name   |Description |-|Category   | Name          |Description |
|----------|--------|------------|-|-----------|---------------|------------|
|Logic     |Switch  |switch      |-|Transform  |Set variable   |set         |
|Logic     |Operation Switch |on op |-|Transform |Validate|JSON schema      |
|Logic     |If      |if          |-|Transform  |Gateway script |any code    |
|Logic     |Throw   |exception handling |-|Transform |XML to JSON |transform |
|Transform |Redac   |obfuscate   |-|Transform  |JSON to XML    |transform |
|Transform |Map     |mapping     |-|Security   |Validate JWT   |JSON Web Token |
|Transform |XSLT    |any code    |-|Security   |Validate UNT   |UserName Token |
|Transform |Invoke  |invoke      |-|Security   |Generate JWT   |JSON Web Token |
|Transform |Proxy   |proxie      |-|Security   |Generate LTPA  |LTPA (for WAS) |
|Transform |Activity Log |audit  |-|User Defined |Any          |any logic coded in DP |


# Installation
This chapter just illustrates one way to install the product in a very simple case. There are many more options to deploy install API Connect including full docker installation. The goal here is just to give a feeling on the installation process.
* Install the gateway
<br>Start the OVA in VMWare, install firmware update if needed to DataPower, adjust network settings.
* Manager
<br>Start the OVA in VMWare, adjust network settings, configure gateway access and configure portal.
* Portal
<br>Start the OVA in VMWare, adjust network settings and exchange keys so manager can interact with portal.
* Toolkit
<br>On Windows or Linux, install IBM NodeJS SDK and install api-connect toolkit using npm
* Collective
<br>Install controller (WAS liberty) + IHS + member (nodeJS) and configure IHS Plugin

# Steps for the lab

<To be updated from here: stop 31 st March, work in progress>
+ How to create and test a REST API definition (Lab)
+ How to publish an API to Bluemix (Lab)
+ How to sucribe to an API previously published and test in the portal (Lab)


1. [Provision API Connect in Bluemix](#step-1---provision-api-connect-in-bluemix)
2. [Create a Cloudant service](#step-2---create-a-Cloudant-service)
2. [Create a LoopBack application](#step-3---create-a-loopback-application)
3. [Manage your API in API Designer](#step-4---manage-your-api-in-api-designer)
5. [Test your API](#step-5---Test-your-API)
6. [Publish your API to Bluemix](#step-6---publish-your-api-to-bluemix)
7. [Consumer Experience](#step-7---consumer-experience)
8. [Invoke the API](#step-8---invoke-the-api)
9. [Analytics](#step-9---Analytics)
10. [Invoke your API from Mobile](#step-10---invoke-your-api-from-mobile)


# Step 1 - Provision  API Connect in Bluemix

From the Bluemix [Catalog] [bmx_catalog_uk_url], in the UK region, provision (create) an instance of the service **API Connect**.

# Step 2 - Create a Cloudant service

In order to store our data used by our API, we will need a persistent storage. To do so, we will use a Cloudant NoSQL database, a JSON document oriented store, compatible with CouchDB.

You can use a existing Cloudant service or create an instance of the service Cloudant DB.

1. Go to the Bluemix Catalog, create an instance of the service Cloudant NoSQL DB.

2. Search for **Cloudant** in the catalog

1. Select the free **Lite** plan

2. Give it a name such as **cloudant-db**.

3. Launch the Cloudand Dashboard. A new tab should open automatically with the list of databases.

4. Create a new database with the button on top right corner. Call this dabase : **test**. Make sure to use this name as this is expected by the persistence layer of API Connect.

5. Go back to Bluemix console and click the tab Service Credentials.

 ```
{
"credentials": {
    "username": "XXXXXX",
    "password": "XXXXXX",
    "host": "f9246334-58d1-4a97-8bde-34c30121f063-bluemix.cloudant.com",
    "port": 443,
    "url": "https://USERNAME:PASSWORD@f9246334-58d1-4a97-8bde-34c30121f063-bluemix.cloudant.com"
}
}
```
1. Copy the url, username and password from the credentials into the your prefered editor. we will use these values later.



# Step 3 - Create a LoopBack application

API Connect comes with a developer toolkit. This toolkit provides an offline graphical user interace named API Designer for creating APIs, the LoopBack framework for developing REST applications, a local unit test environment that includes a Micro Gateway for testing APIs, and a set of command line tools for augmenting the development toolset and assisting devops engineers with continuous integration and delivery.

1. Get help on the **apic** command set:
  ```
  apic -h
  ```

The developer toolkit provides an integrated development environment for developing APIs and applications that use the LoopBack framework.

To create a new LoopBack project, use the command apic loopback; then use the apic edit command to edit the project in the API Designer.

>**Note**: When working with the toolkit always be careful of where you are located on your file system. The working directory from where the apic command are started will be considered as the root of the loopback projects and products/APIs you are working at some point. Cautious must be taken on how you organise the directories. It also msut take in considerations that at some point you will want to source control some of the generated files (such as the yaml files for example) in a Source Control Management system such as github.


1. Create an API Connect LoopBack application.

  ```
  $ mkdir -p <your-favorite-working-dir>/apic/myfirstproject
  $ cd <your-favorite-working-dir>/apic/myfirstproject
  $ apic loopback
  ```

 Next you will be asked to supply the name of the directory where the application will be created. Enter **demo**

  ```
  What's the name of your application? demo
  ```

1. LoopBack will default the project directory name to the name of the application.

1. Press the ***Enter*** or ***Return*** key to accept the default value of inventory.

1. Next you will be asked to select the type of application. Use the arrow keys to select the **empty-server** option and press the ***Enter*** or ***Return*** key.

```❯ empty-server (An empty LoopBack API, without any configured models or datasources) ```

1. At this point, the project builder will install the core dependencies for our Node.js application.

  ```
  ? Please review the license for API Connect available in /usr/local/lib/node_modules/apiconnect/LICENSE.txt and select yes to accept. yese arrow keys)
  ? What's the name of your application? demo
  ? Enter name of the directory to contain the project: demo
  ? What kind of application do you have in mind? empty-server (An empty LoopBack API, without any configured models or datasources)
  ```

1. Change directory to your application directory

  ```
  cd demo
  ```

### Create a Datasource Connector to Cloudant

The datasource is what allows the API to communicate with the backend data repository. In this case we will be using Cloudant to store the data item information.

There are two parts to this. First is the definition of how to connect to the backend system. The second is downloading the actual loopback connector for Cloudant.

In your terminal ensure that you are in the **demo** directory.

  ```
  cd demo
  ```

In your terminal, type:

 ```
 apic create --type datasource
 ```

 The terminal will bring up the configuration wizard for our new datasource for the item database. The configuration wizard will prompt you with a series of questions. Some questions require text input, others offer a selectable menu of pre-defined choices.

Answer the questions with the following data:

> **Note**:
> <mark>For **Connection String url** paste the previous value you copied about Cloudant credential in Step 1</mark>

Option name         | Values
--------------------|------------------
? Enter the data-source name :      | **db**
? Select the connector for db :     | **IBM Cloudant DB**
? Connection String url to override other settings       | **YOUR Connection URL https://username:password@host**
? database :      | **test**
? username :      |          
? password :      |
? modelIndex :    |
? Install loopback-connector-cloudant@^1.0.4 |  **Y**

Example :

```
? Enter the data-source name: db
? Select the connector for db: IBM Cloudant DB (supported by StrongLoop)
Connector-specific configuration:
? Connection String url to override other settings (eg: https://username:password@host): https:
//a836946d-92b5-41cc-b730-442b4235aae8-bluemix:7911bb5592e65f126903c59f6fa3d7f3b5bd4a1141951e31
938b6c6cb2efa852@a836946d-92b5-41cc-b730-442b4235aae8-bluemix.cloudant.com
? database: test
? username:
? password:
? modelIndex:
? Install loopback-connector-cloudant@^1.0.4 Yes
```

>**Note**:
By typing Y (Yes) to the question Install loopback-connector-cloudant, the Cloudant Connector will be downloaded and saved to your project automatically.

>This will create a connection profile in the ~/demo/server/datasources.json file. It is effectively the same as running the following to install the connector:

>npm install loopback-connector-cloudant --save

>For more information on the LoopBack Connector for Cloudant, see: https://www.npmjs.com/package/loopback-connector-cloudant


>Note : You can create an api directly from a existing web service from the wsdl. Create a SOAP API definition from a WSDL definition file, or a .zip file that contains the WSDL definition files for a service with the following command: ```apic create --type api --wsdl filename```

>Note: You can create an API or Product from an OpenAPI (Swagger 2.0) template file by using the '--template template-name' option.


# Step 4 - Manage your API in API Designer

1. Launch API Connect Designer

  ```apic edit```

  If the designer started correctly, a webpage will automatically opens and the terminal will show a message similar to this one:

  ```Express server listening on http://127.0.0.1:9000```

1. Click **Sign in with Bluemix**. If you're already sign in with Bluemix, you'll be automatically signed into the designer.

1. The designer opens into the APIs section showing the API definition we created from the command line.

![APIC Screenshot](./images/apic-firstscreen.png)

###Create a Model for the **demo** items

In this section, you will define the item data model for our **demo** API and attach it to the Cloudant datasource. LoopBack is a data model driven framework. The properties of the data model will become the JSON elements of the API request and response payloads.

1. Click the **Models** tab.

1. Click the ```+ Add``` button.

1. In the New LoopBack Model dialog, enter **Customer** as the model name, then click the New button.

2. When the Model edit page for the item model displays, select the **db** Data Source:

####Create Properties for the Customer Model

The ```Customer``` table in the database has 6 columns that will need to mapped as well. To start creating properties for the item model:

1. Click the ```+ button``` in the Properties section.

1. The ```Customer``` data model consists of six properties. Use the data below to add each of the properties:

| Required |  Property Name  | Is Array | Type  | ID | Index |Description |
|:---------|:---------------:| --------:|------:|---:|------:|-----------:|
| yes      | name            | no       | String| no |   no  | Name       |
| yes      | age             | no       | number| no |   no  | Age        |


1. Scroll to the top of the page and click the **Save button** to save the data model.

![All Models](./images/allmodel.png)


2. Click the All Models link to return to the main API Designer page.


# Step 5 - Test your API

1. Let's test the API in the Designer. First, start the server by clicking the play button in bottom left corner. Once the server is started, you should see the endpoint of the Local Micro Gateway.

![APIC Screenshot](./images/apic-server.gif)

1. On the server is started, Click on **Explore** in the top right corner.

1. Select the operation POST /Customers. Click on *Generate* hyperlink before the button **Call operation** in the right panel.

  ```
  {
  "name": "YOUR NAME",
  "id": -30239449.275000483
  }
  ```
![APIC Test](./images/apic-test.gif)


1. The first time you will most likely get a CORS error as follows:

  ```
  No response received. Causes include a lack of CORS support on the target server, the server being unavailable, or an untrusted certificate being encountered.
  Clicking the link below will open the server in a new tab. If the browser displays a certificate issue, you may choose to accept it and return here to test again.
  https://$(catalog.host)/api/Customers
  ```

1. Open the url below in a new tab of your browser:

  https://localhost:4002/api/Customers

1. Click on Advanced. Accept the exception.

1. Go back to the Explore view in API Designer and click **Call operation** again. You should get a successful response code 200 OK.

1. If you have kept the Cloudant DB dahsboard open, you can select the database **test** and view the newly created record.

1. Congratulations you successfullly tested your API.


# Step 6 - Publish your API to Bluemix

1. In the API Designer, select the tab APIs and click on your **demo** API. Switch from the *Design* view to *Assemble*. In the left hand side panel, switch from **Micro Gateway policies** to **DataPower Gateway policies**. Save the change.

1. Click on **Publish** in the top right corner. Select **Add and Manage Targets**.

1. Select **Add IBM Bluemix Target**. Select the Region such as United Kingdom where you created the API connect instance, then the Organization (Space). Finally, select the default catalog **Sandbox** and **Next**

1. In the page Select a Bluemix application, type a new application name such as **demo-app**. Click + to add your app in the list. Then Save.

1. Click again on Publish in the top right corner. Select the newly created target.

1. Check the box **Publish Application** and **Stage or Publish products > Stage only**. Click Publish.


>Note:
Here we have the opportunity to select what gets published. If we were working on multiple API products as part of this project, we could chose specific ones to publish.

>Also, the option exists to only Stage the product. A Stage-only action implies that we’ll push the configuration to the Management server, but not actually make it available for consumption yet. The reason for doing this may be because your user permissions only allow staging, or that a different group is in charge of publishing Products.

1. The publishing operation generates messages in the terminal window where you started APIC. You can see that some properties are updated during publush process.

```
Deploying to Bluemix
...preparing project
...building package for deploy
...uploading package
Runtime published successfully.

Management URL: https://new-console.eu-gb.bluemix.net/apps/e48d87d6-6fbe-4be1-9795-958f0ef532bb
API target urls: apiconnect-e48d87d6-6fbe-4be1-9795-958f0ef532bb.fredericdutheilfribmcom-fdulondonspace.apic.eu-gb.mybluemix.net
API invoke tls-profile: client:Loopback-client
Updated demo.yaml with tls-profile and target-url.
Found 1 files to publish.
Staged /Users/fred/Works/Sandbox/demo/definitions/demo-product.yaml to fredericdutheilfribmcom-fdulondonspace:sb [demo:1.0.0]
Successfully published products

```

1. Go to the Bluemix [Dashboard] [bmx_dashboard_url]. You should see a new Cloud Foundry app called **demo-app** which is the Loopback app we just published.

At this time, your API is not avaible for consumer. First you need initialize the API Portal and publish your API on it.

1. Open the service instance api-connect. Launch API Manager.

1. In the main page, click the Sandbox catalog.

1. Click on the tab **Settings**, then select the sub menu Portal. In the Portal Configuration, select IBM Developper portal instead of None. and then click **Save**. It will automatically generate the portal URL and the portal as well.

  A pop up screen will let you know that the process to create your portal has started.
  ```Creating the developer portal for catalog 'Sandbox' may take a few minutes. You will receive an email when the portal is available.```

It might take some time for your developer portal to get created, but usually the process is pretty quick. Once the portal is done creating, you will receive an email.

So now we are going to publish our API

1. In the API manager, on the product **demo**, click the **...** next to the state and click on **Publish** in the menu. Use default value and then click **Publish** again

![APIC Publish](./images/apic-publish.gif)

2. Your demo API is now visible in Developer Portal



# Step 7 - Consumer Experience

>Summary: In this lab, you will learn the consumer experience for APIs that have been exposed to your developer organization. Using the developer portal, you will first login in as the admin user to load a Think IBM custom theme. You will then login as a developer to register your application and then subscribe to an API and test that API.

 1. Return to the Bluemix API Manager screen.
 2. Navigate to the Dashboard section and click on the Sandbox catalog tile.
 3. Choose the Settings tab, followed by the Portal option.
 4. Click on the Portal URL link to launch the Developer Portal

![Launch Portal](./images/launch-portal.png)

 5. Login into the developer portal as an administrator using admin as  username and the password you set up in previous Lab.

 6. Click on **API Products** to explore the available APIs


## Register an Application as a developer

Let's now subscribe to the API. You will log into the portal as a user in the application developer role, then register an application that will be used to consume APIs.

If you have not created a developer account, you will need to use the **Create an account** link to do so now.

![Create users](./images/apic-portal.png)

 1. Enter in your account information for the developer account. This must be a different email address than your bluemix account. Click **Create New Account** once all the requisite data in the form has been filled out.

 1. A validation email will be sent out to the email address used at sign up. Click on the validation link and then you will have completed the sign up process and will be authenticated into the page.

 1. Login into the developer portal as an application developer using your developer credentials.

 2. Click the Apps link, then click on the **Create new App** link.

 3. Enter a title and description for the application and click the Submit button.

 >Title: Mobile App Consumer

 >Description: Test Application for demo APIs

 >OAuth Redirect URI: < leave blank >

We need to capture the Client Secret and Client ID in a text editor for later use by our test application.

  1. Select the Show Client Secret checkbox next to Client Secret at the top of the page and the Show checkbox next to Client ID.

![Register app](./images/apic-registerapp.png)


  2. **Copy Client Secret and Client ID in a text editor**

## Subscribe to a Plan for the demo APIs

In this section, we will subscribe to a plan for the demo APIs using the Mobile App Consumer application.

  1. Click the ```API Products link.``
  2. Click the demo (v1.0.0) API product link.

You will be directed to the Product page which lists the available plans for subscription.

  1. Click on the **Subscribe** button under the ***Default plan***.
  2. Select the **Mobile App Consumer** toggle and click the **Subscribe** button.

The MobileApp Consumer application is now subscribed to the **Default plan** for the think API product.

## Test demo Product APIs from the Developer Portal

In this section, we will use the developer portal to test demo API. This is useful for application developers to try out the APIs before their application is fully developed or to simply see the expected response based on inputs they provide the API. We will test the **demo** API from the developer portal.

1. Click the **demo** link on the left-hand navigation menu and then expand the GET /Customer path by clicking on the twisty next to the path.

![Test app](./images/apic-testapidevportal.png)

1. Scroll down to the Try this operation section for the GET /Customer path. Enter your Client ID and your Client secret and click the Call Operation button
2. Scoll down below the Call operation button. You should see a 200 OK and a response body as shown below.

![Test app](./images/apic-testapidevportalcall.gif)


# Step 8 - Invoke the API

Now that you have browsed the API Portal and registered / tested the API’s that **demo** is providing, it’s time to test them out from a real application.

Sample code (snippets) are provided from developer portal for different language (cUrl, Ruby, Python, PHP, Javascript, Java, Go, Swift) .

  1. Login into the developer portal as an application developer using your developer credentials.
  2. Click the **API Products link**
  3. Click the **demo (v1.0.0)** API product link.
  4. Click on **demo** API in the left panel
  5. Now, you can discover all operations with their properties and on the right hand side sample code.
  1. On the right hand side you'll see the ***cuRL** expression
  1. Copy it into your text editor window replacing **REPLACE_WITH_CLIENT_ID** and **REPLACE_WITH_CLIENT_SECRET** with your client id and your client secret saved from the prior step
  2. Remove ***"filter"*** parameter in the url the result is like this :

  ```
curl --request GET \
  --url 'https://api.eu.apiconnect.ibmcloud.com/BLUEMIXID-BLUEMIXSPACE/sb/api/Customers' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header 'x-ibm-client-id: REPLACE_WITH_CLIENT_ID' \
  --header 'x-ibm-client-secret: REPLACE_WITH_CLIENT_SECRET'
```

3. Copy and try it into your terminal windows

If all is OK, you should see a list of ***cutomers*** in JSON format with items ***name*** and ***age***.


# Step 9 - Analytics

1. Return to the Bluemix API Manager screen.
2. Navigate to the Dashboard section and click on the **Sandbox** catalog tile.
3. Click on your **demo** API and you can see number of subscriptions to you API.

![Anaytic screen](./images/apic-analytics.png)

4. To see analytic informations, click on the analytic icon.
![Anaytic icon app](./images/apic-analyticicon.png)

5. Now you can navigate to the Analytic dasbord to show analytic informations for your API
6. You can show

![Anaytic icon app](./images/apic-analyticdashboard.gif)

1. Click on the ```Sandbox``` catalog tile
2. From the ```Sandbox``` catalog configuration screen, click on the ```Analytics``` tab.
 ![Anaytic screen](./images/analytics-tab.png)

3. The default dashboard gives some general information like the 5 most active Products and 5 most active APIs. This information is interesting, but we can see much more information by customizing the dashboard. Add a new visualization by clicking on the ```+ Add Visualization icon.```

 ![Anaytic screen](./images/analytics-add-visualization.png)

4. This will bring a list of some of the standard visualizations. You can then type in a string to filter through visualizations or use the arrows to page through the list.
5. Add the API Calls visualization to the dashboard by simply clicking on it. The new visualization will be added to the bottom of our dashboard.
 ![Anaytic screen](./images/analytics-add-visualization-item.png)
5. Scroll down to find the new visualization. You can adjust the size by clicking and dragging the border from the lower right. Additionally, you can adjust its position by clicking and dragging the box to where you want it.
 ![Anaytic screen](./images/analytics-add-visualization-new.png)
6. Feel free to play around with the other visualizations by adding them to the Dashboard. You can also save the dashboard by clicking on the Save Dashboard button:
 ![Anaytic screen](./images/analytics-save-dashboard.png)

# Step 10 - Invoke your API from Mobile

In this lab, you will learn how to consume an API from a Mobile Application.

In this case, we will use a very simple sample of a Mobile Hybrid Application with the framework Ionic 1.7.

##Prepare your environment and the Mobile Application

 1. Retrieve the sample from this url

 [Mobile App Sample](https://github.com/fdut/bluemix-labs/raw/master/Lab%20API%20-%20Manage%20your%20APIs%20with%20API%20Connect/mobileapp.zip)
https://github.com/fdut/bluemix-labs/raw/master/Lab%20API%20-%20Manage%20your%20APIs%20with%20API%20Connect/mobileapp.zip

 1. Unzip file and enter in the **mobileapp** folder
 2. Install cordova and ionic 1.7 framework

   ```
   npm install -g cordova@6.2 ionic@1.7.6
   ```

 1. Test installation

  ```
  cordova -v
  6.2

  ionic -v
  1.7.6
  ```

 1. Update your application with the url and the credential of your API (Remember the subscription step).

 Update (with your preferred editor) the file **mobileapp/www/js/controllers.js** with your value for **urlBase** and **headersBase**

 ```
  var urlBase = 'https://api.eu.apiconnect.ibmcloud.com/fredericdutheilfribmcom-fdulondonspace/sb/api/Customers'; //MUST REPLACE WITH API URL

  var headersBase =

  {
    'X-IBM-Client-Id': '262fc263-3776-422b-bdcb-f2c1649a8d3d', //MUST REPLACE WITH CLIENT ID
    'X-IBM-Client-Secret': 'vJ0aE1wI4kI6aT5fO8pD8uI2sS7sN4pD0cW6kJ6nQ8mY4qS5rH', //MUST REPLACE WITH CLIENT SECRET
    'content-type': 'application/json',
    'accept': 'application/json'
  }
```

 1. Save and go back to the root directory of you app : **mobileapp**



##Simulate the Mobile App in a browser.

 2. Enter the following command :

  ```
   ionic serve
  ```
  >Note : if asked, use localhost for address to use.

  This command simulate your app in a browser.

  If all values are correct, you should see something as the screenshot below. A list with all the entries you are "POSTed" in Cloudant

   ![Simulate dev tools](./images/simulateapp.png)

 >Note : You can activate developer tools in the browser to show the result of your API request.

   ![Simulate dev tools](./images/simulatewithtools.png)


##Emulate the Mobile App with in a Android device emulator

 Now if you want, you can emulate you app in a emulator. In this sample we are going to use Android Emulator.

### Install Android SDK

  If Android SDK is not installed, use the following steps to install it (Example for linux)

  ```
   wget http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz
   tar -xzvf android-sdk_r24.4.1-linux.tgz

   cd android-sdk-linux
   cd tools

   echo y | ./android update sdk -u -a -t "tools","platform-tools","build-tools-23.0.3","android-23","sys-img-x86_64-android-23","sys-img-x86_64-google_apis-23"

  ```
  Add **android-sdk-linux/tools/android** in the **PATH** of your operating system

 For linux only :

  ```
   sudo apt-get install -y lib32gcc1 libc6-i386 lib32z1 lib32stdc++6
   sudo apt-get install -y lib32ncurses5 lib32gomp1 lib32z1-dev
  ```




### Configure Android virtual device


 1. Configure virtual device with the following command :

 ```
 android avd
 ```
 Click **Create** Use the following value :

 ```
 avd name = avd1
 Device = nexus 5
 Target = Android 6.0
 cpu = intel atom x86_64
 skin = noskin
 Front camera = none
 Back Camera = none
 RAM 512 vm 64
 ```
 1. And click **OK**

###Launch the Mobile App with in the Android Virtual Device Emulator

 1. In the **mobileapp** folder, enter the following command :

 ```
 cordova platform add android
 ```
 and

 ```
 ionic emulate android
 ```
Please wait a few time.


 ![Simulate dev tools](./images/emulate.png)

>Note : If the launch is too long. Don't close the emulator, Stop the command with Ctrl+C and launch the command again.


Congratulations. You have completed this Lab!


# Additional Resources

For additional resources pay close attention to the following:

- [API Connect v5 Getting Started: Toolkit Command Line Interface](https://github.com/ibm-apiconnect/cli)
- [API Connect v5 Getting Started: API Products](https://github.com/ibm-apiconnect/product)
- [API Connect Developer Center](https://developer.ibm.com/apiconnect)
- [API Connect v5 Knowledge Center](http://www.ibm.com/support/knowledgecenter/SSMNED_5.0.0/mapfiles/ic_home.html)
- [Follow us @ibmapiconnect](https://twitter.com/ibmapiconnect)
- [POT API Connect](https://ibm-apiconnect.github.io/pot/)
- [POT API Connect Customization](https://ibm-apiconnect.github.io/faststart/)
- [PSA Sample of customized portal](https://developer.psa-peugeot-citroen.com/)


[bmx_dashboard_url]:  https://console.eu-gb.bluemix.net/
[bmx_catalog_uk_url]: https://console.eu-gb.bluemix.net/catalog/
