<p align="center"><img src="./images/apic_banner-mini.png"</p>

# Introduction
This article is the updated version for V2018. The original version was addressing V5, and can be found [here](./ReadMe.V5.md). This article is made of two parts. In the first section, we explain what is the purpose of API connect and the concepts behind IBM API Connect. Then in the second section, we will practice labs in order to get hands-on with IBM API Connect. Throughout the lab, you’ll get a chance to use the `apic` command line interface for creating LoopBack applications, the intuitive Web-based user interface, and explore the various aspects associated with solution’s configuration of REST API as well as SOAP APIs.

> **Note**:
This is an onPremise version installed as part of IBM Cloud Pak for Integration (ICP4I). This cloud pak contains API Connect 2018.4.1.7fp3. It will be updated as much as possible to follow the new versions of API Connect. When relevant to show new features introduced by version V2018.1.4.8fix1, we will also show some new screen and will precisely indicate that this is the latest version.
The version 2018.x is out since 30th March 2018, and the LTS has been released on 15th November 2018. Due to the significant changes brought by APIC V2018 and also because IBM Cloud (former Bluemix) is using API Connect v5 as of today (19th November 2019), this lab will use the onPremise version, and an updated version of the lab will be made when the IBM Cloud infrastructure is updated. The SaaS version of API connect should be released very soon.

>For any comments, please send an email to arnauld_desprets@fr.ibm.com (Arnauld Desprets).


# Objective

In the following lab, you will learn:

+ Goals of API Connect, main use cases (Presentation)
+ Basics on the architecture of the API Connect v2018 and terminology useful with API Connect (Presentation)
+ Installation (Presentation)
+ How to create and test a REST API definition (Lab)
+ How to publish an API to Bluemix (Lab)
+ How to subscribe to an API previously published and test in the portal (Lab)
+ How to create a simple LoopBack application to implement Microservice architecture (Lab)
+ How to version an API and deploy another version of an API (Lab)
+ How to create and manage a SOAP API (Lab)
+ Basics about the command line apic to script recurring operations (Lab)
+ Transformation JSON to SOAP (Lab)
+ API security (Lab)

# Pre-Requisites
It is possible in IBM API Connect to either develop locally on a developer machine or develop directly in the Manager. The user experience is very similar in both cases. Developing locally provide the benefits of being able to directly use a source control management system such as Git.
+ Download the Designer
+ Have an API Connect instance available (in our case the ICP4I instance)
+ In order to perform some basic local testing we will also use the LTE - Local Test Environment which allows to perform simple testing locally. The LTE is as of today in beta.

There is no need to install the designer since this is a simple executable. For the Local Test environment, I'm using a Ubuntu desktop because it is simpler to use Docker on it rather than on Windows where there are some incompatibilities between Docker and VMWare. The installation of the LTE is explained here.

**Hint:** to find the various executable for a specific version, you can find all the link in article called IBM API Connect <specific version> is available. for example, you will find an articled called *IBM API Connect V2018.4.1.8-iFix1.0 is available* [here](https://www.ibm.com/support/pages/ibm-api-connect-v2018418-ifix10-available). In this article , you will find the content of the fix, the link to the various images usually in Fix Central and optionally the link to the LTE.

# Goals of API Connect, main use cases
This chapter does not intend to describe all the possible use cases of API Connect, but instead provide some simple and concrete common usages of API Connect.
## Main use cases
1. **Use case 1**: I have existing internal SOAP services and/or REST APIs. I want to expose and increase visibility internally and externally. I need to understand how my APIs/Services are used and apply quotas. I need to provide to secure the access.
<br><span style="text-decoration: underline;">Solution</span>: Simple proxyfication, not complex policies, use OOTB portal, manager.
2. **Use case 2**: All the above + my APIs/services do not have the right granularity or the right format to be used by my Apps.
<br><span style="text-decoration: underline;">Solution</span>: Use map policies to adapt the interfaces, and/or use JSON <-> XML policies with a powerful versioning management.
3. **Use case 3**: I organise a hackathon or I'm in context of co-creation with extended eco-system and I need to rapidly create APIs from data sources or from models.
<br><span style="text-decoration: underline;">Solution</span>: Create Loopback Applications and expose them as APIs. Cloud workload are good candidates.
4. **Use case 4**: I need some kind of composition/aggregation and expose an API.
<br><span style="text-decoration: underline;">Solution</span>: Create a Loopback Application and add remote hook
## Where APIs are used in companies?
Here is the result of Forrester study, performed in February 2017.

![ForresterStudy](./images/ForresterStudy.png)
<br>*Fig. 1: Forrester use cases study*</br>

As you can see a lot of projects are using API internally , and the very visible part, the public projects represents 35%.

Read the full study: The Total Economic Impact™ of an API Management Solution http://ibm.biz/APICTEIstudy


# Architecture and terminology
## API Connect architecture onPremise

### Components in IBM API Connect 2018
The main components composing API Connect are:
+ The **Gateway** (IBM DataPower Gateway). The requests from apps are going through the gateway, policies are enforced and API events for the analytics are generated.
+ The **Analytics** is a full Elastic Stack deployment. This is a new feature of APIC v2018. The analytics are non longer part of the manager, which allows for true multi cloud architecture, where the Gateways can be deployed in another separated environment along the analytics which require some kind of colocalization for performance reasons. Notice that the Elastic Stack is partially optional, in the case, where you do already have your own instance. In the case, where you really do not want to use the internal analytics then it is possible to only install the ingestion part.
+ The **Portal**, an open source Drupal CMS - Content Management System. For the API consumers (Apps developers), they create Apps and subscribe to API within the portal. Based on Drupal, it is highly customizable. In v2018, Drupal was updated to version 8.
+ The **Loopback runtime** or micro services runtime. This is where the loopback applications are running. This component is originally coming from StrongLoop acquisition. Loopback applications can be created in minutes to expose data from SQL or NoSQL database and also a good place to perform composition of APIs, especially if you do not have some ESB capabilities.
+ Associated to the Loopback runtime is the **Kubernetes** that monitors the Loopback runtime and can provide advanced feature such as auto-scaling.
+ The **Designer**, it offers the same web experience as the manager to manage APIs and allow development on the developer's machine.
+ The apic toolkit, really the CLI for APIC. APIC is developed in a simple manner and accessible through REST/JSON API. So the Web UI, the apic CLI are just based on those REST API. This is also a new benefit of the V2018, where we have now a complete set of supported REST API, in order to configure initially the product (APIC Cloud), the Manager and the portal.

From an architecture point of view and it is important to consider that for HA the notion of quorum arise, and I would advise to have a good understanding of what are the implications. Finally, APIC V2018 is a complete rewrite and redesigned version based on the use of Docker and Kubernetes. If you do not have a Kubernetes platform available, it is possible to use OVA that are encapsulating the Kubernetes environments. apic CLI encapsulate the Kubectl/docker hiding the complexity of this platform. I would argue that even with OVA, it will be an advantage to understand Kubernetes and Docker principle.

>Below a sample of deployment of API Connect on premise. System API is a generic term to define an API implementation, for example running in WAS Liberty (JAX-RS) or an API exposed on another layer such as an ESB.

![V2018 APIC Achitecture](./images/v2018.apic-archi-on-prem.png)
<br>*Fig. 2: V2018 Architecture*</br>

In more details some of the communications between each components in an OVA deployment non HA. For more information, see the Required Ports between zones [here](https://www.ibm.com/support/knowledgecenter/SSMNED_2018/com.ibm.apic.install.doc/overview_apimgmt_portreqs_vmware.html) for OVA deployments or [here](https://www.ibm.com/support/knowledgecenter/SSMNED_2018/com.ibm.apic.install.doc/overview_apimgmt_portreqs.html) for Kubernetes deployments.

![V2018 APIC communications](./images/V2018OVADeploymentCommunications.png)
<br>*Fig. 3: Communications between componants*</br>

### A word on quorum
Nowadays a lot of systems containing data are distributed. This increases availability but at the same time data consistency between the various instances is highly required. There are several strategies to support this requirement, active-passive, active-active where it becomes a little bit more difficult. One approach to solve this is to use the notion of quorum, where using a simple mathematical decision (N-1)/2 a decision can be taken to identify whether the system should be shut down in order to avoid data corruption or to keep the system available but alert that data corruption has occurred and some reconciliation work may have to happen. Many components in API Connect or related to API Connect are based on distributed databases. Kubernetes etcd, Elastic Stack, Cassandra, Redis, etc ... When you design your topology, I would really advise that you understand what you want, what can be done and what may happened if losing quorum, how the individual component will behave. You should also perform some disaster testing according what you try to achieve. There are a lot of literature on this topic available. One final word, for fun, remember that ∀ n ∈ ℕ (n-1)/2 < n/2 , that means that if you loose half of your instances you are in trouble and you need to start worrying about what is happening!

## Terminology
+ An **Organization**: It is the highest logical level of separation, it may provide multitenancy if required. An organization has its own catalog, members, resources, etc ... It is managed from the cloud console (not the manager).
+ An **API**: Can be SOAP or REpresentational State Transfer - REST API defined with an Open API definition (Swagger) as a YAML file. One API = one yaml file though WSDLs and Schema are separated in a zip file for a SOAP API.
+ A **Plan**: this is where we specify the quotas and if an approval is needed to subscribe to a Product/API.
+ A **Product**: this is an aggregation of APIs, and one or many plans associated to those APIs. This is what is published to a catalog. One Product = one yaml file.
+ A **Catalog**: it's relates to a cluster of gateways and a portal. It sounds like an environment but it also contains a business dimension. For example, good names for a catalog are Sandbox, Dev, Production, CRM (for my CRM APIs exposed to a specific population), etc ...
+ An API Connect **Cloud**: not to be confused with a cloud infrastructure/platform, it is a combination of gateways clusters, managers cluster, portal clusters and loopback applications runtimes. Usually a customer will have one, two, sometime three or more API Connect clouds, based on its organization and needs to separate the infrastructures.
+ **Assembly panel**: this is where we specify the policies to be executed in the gateway for each transactions.

## Concepts maps
Below the concepts related to the overall product. There are many ways to choose the right deployment based on requirements.

The questions to ask:
1. How many APIC clouds? (usually between 1 and 3, driver: production separated or not from non production and other environments)
1. How many clusters of gateways? (separate instances, driver: usually security zones (DMZ or not and others zones))
1. How many gateway services? (drivers: the number of clusters of gateway above, and isolation)
1. How many instances for each components? (how many instances of managers (usually 2 per APIC Cloud), instances of gateways (usually at least 2 depending on the traffic and high availability desired), instances of portals (usually 3 per APIC Cloud))

![APIC Concepts](./images/v2018.apic-ConceptsMap.png)


Below the concepts related to the subscription of an App to a Plan within a product referring to all APIs or a set of APIs within that product.
<br>![APIC Subscription](./images/subscription.png)</br>

Below the concepts related to the organisation of the user registries.
<br>![APIC User Registries](./images/apic-registries.png)</br>

Below the available policies in API Connect 2018.4.1.8fp1
<br>![C2018.4.1.8 Policies](./images/v2018.policies.png)</br>



|Category  | Name         |Description        |-|Category   | Name          |Description      |
|----------|--------------|-------------------|-|-----------|---------------|-----------------|
|Logic     |Switch        |switch             |-|Other      |Invoke         |invoke           |
|Logic     |Throw         |exception handling |-|Other      |Log            |log              |
|Transform |JSON to XML   |transform          |-|Other      |Rate limit     |quota mgmt       |
|Transform |Map           |mapping            |-|Other      |Set Variable   |set              |
|Transform |Parse         |deserialise        |-|Other      |Validate       |Schema validates |
|Transform |XML to JSON   |transform          |-|Transform  |Security       |Authenticate     |
|Transform |Redaction     |obfuscate          |-|Other      |Security       |Generate JWT     |
|Transform |XSLT          |any code           |-|Transform  |Security       |User Security    |
|Other     |GatewayScript |any code           |-|Transform  |Security       |Validate JWT     |

# Lifecycle of a Product
The lifecycle of a product is as follow:

![ProductsLifeCycle](./images/diagram_product_lifecycle.jpg)

It is possible to use an approbation control between each transition
# Overall design of the lab

The goal of this lab is to build the following APIs:
![ProductsAndAPIsToBuild](./images/ProductsAPIsToBuild.png)

This provides a mix of REST and SOAP APIs, with or without mapping, using or not a Loopback Application.

The corresponding back end runtimes are as follow:
![RuntimesAndBackEnd](./images/RuntimesAndBackEnd.png)
This provides a mix of JAX RS, JAX WS, and NodeJS (with Loopback Application) for pure cloud APIs. The use of Secure Gateway in relation with a local deployment would demonstrate hybrid APIs.

# Steps for the lab

1. [Check the development environment](#step-1---check-the-development-environment)
1. [Expose an existing REST API](#step-2---expose-an-existing-rest-api)
1. [Publish your API to the Sandbox catalog](#step-3---publish-your-api-to-the-sandbox-catalog)
1. [Consumer Experience](#step-4---consumer-experience)
1. [Invoke the API](#step-5---invoke-the-api)
1. [Analytics](#step-6---analytics)
1. [Create a SOAP API ](#step-7---create-a-soap-api)
1. [Create a SOAP to REST API ](#step-8---create-a-soap-to-rest-api)
1. [Create a Cloudant service](#step-9---create-a-cloudant-service)
1. [Create a LoopBack application](#step-10---create-a-loopback-application)
1. [Manage your API in API Designer](#step-11---manage-your-api-in-api-designer)
1. [Test your API](#step-12---test-your-api)
1. [Using OAuth to protect your API](#step-13---using-oauth-to-protect-your-api)

# Step 1 - Check the development environment
For this lab, we are going to use the Designer instead of using the manager. We also use the Local Test Environment to perform basic testing. We will then deploy the API into the sandbox catalog from the designer.
>**Note**: Using the toolkit/designer (locally) or using manager directly (remote server) is a pretty important decision. Using the toolkit has the benefit to use a Source Control Management System and perform micro versioning as well as backup of the various yaml (and wsdls). It also provides a local experience with usually a lower response time. Using the Manager simplifies sharing the API Drafts. In reality, there are ways to benefit of both approaches, especially considering a devOps approach.I'm using a Linux environment, you may have to adjust the commands with your specific environment being Windows or MacOS.

Let's check that development environment is ok.
We first prepare the docker environment to start the local test environment. `sudo docker load < apic-lte-images-2018.4.1.8-ifix2.0.tar.gz`.
The information on the local test environment can be found under the title *Testing an API with the Local Test Environment* in the IBM Knowledge Center.
To start the lte, in my case, cd `~/apic-lte/linux`, then `sudo ./apic-lte start`.

![Start LTE](./images/start-lte.png)

Take a note of the Platform API url, and the user/pwd to be used. we will need them when we start the Designer.
> **Hint:** To check that the LTE is correctly started: `apic login --server localhost:2000 --username shavon --password 7iron-hide --realm provider/default-idp-2`

You should get the following message: Logged into localhost:2000 successfully

To start the designer, just execute the ./api_designer-linux. I assume here you downloaded the version of the Designer from the IBM support site, the version must be similar to the API connect installation.
It does start a window, the first information to specify is the working directory, where the artefacts (yaml) will be created.
![Designer specify working directory](./images/designer-specify-work-dir.png).

Click on Open a folder, and specify the directory where you work.

![Designer specify working directory folder](./images/designer-specify-work-dir-spec.png)

The specify the manager you want to work with, in our case, we will have two locations, the local test environment, and the manager of a remote instance. First let's use the LTE. We enter the information for the local test environment, in our case https://localhost:2000.

![Designer specify working directory folder](./images/designer-new-connection.png)

The login  screen appears, we enter the credentials that were indicated when starting the LTE, in our case shavon/7iron-hide.

![Designer specify working directory folder](./images/designer-connect-manager.png)

The  first screen appears, we are ready to create our first API.

![Designer specify working directory folder](./images/designer-first-screen.png)

# Step 2 - Expose an existing REST API
In this first step, we assume that a developer of an API is providing you the Swagger associated with that API. The developer is using WAS Liberty as the runtime and he also uses JAX-RS annotations along apidiscovery feature. This allows him to get a Swagger easily consumed by API Connect. Download the Swagger [here](./materials/step2/QuoteManagementAPI_AW_S.yaml) on your file system, for example under ~/apic-dev assuming that you have created such directory.

1. Ensure that you have downloaded the yaml correctly `cd ~/Downloads` and the `head QuoteManagementAPI_AW_S.yaml` you should obtain the following:
```
swagger: '2.0'
info:
  description: Quote API
  version: 1.0.0
  title: Quote API
  contact:
    name: Arnauld Desprets
    url: 'http://thequoteapi/terms.html'
    email: arnauld_desprets@fr.ibm.com
  x-ibm-name: quote-api
```
If this is not the case, then download it again or copy it in a file.

1. It  is a good idea to check that the back end API is running before exposing it. In this case, we are going to use the GET verb on the quote operation. Type the following:  `curl -H "Accept: application/json" "http://SampleJAXRS20-aw.eu-gb.mybluemix.net/loanmgt/resources/loans/v1/quote?loanAmount=10000&annualInterestRate=1.1&termInMonths=36"`
You should obtain the following results: {"loanAmount":10000,"annualInterestRate":1.1,"termInMonths":36,"monthlyPaymentAmount":282.51360281363674}.

> This API is not exposed, is not protected, is not monitored, is not governed. Let's use API Connect to fix this.

1. We are using the designer that we opened earlier. Click on *Develop APIs and Products* button. Then click on *Add* and select *API* button on the top right of the screen.

![Designer add API](./images/designer-add-API.png)

Select the *From existing OpenAPI service* and click *Next* button.

![Designer Select from existing Open API](./images/designer-select-from-existing.png)

Select the file downloaded previously and click *Next* button.

![Designer Select OpenAPI file](./images/designer-select-openapi-file.png)

Change the following details
* Base path: /loans/v1
* Description: Supports Loan quote operation and also provide a simple way to add a delay in the back end response time and get variable length messages from back end.
Then click *Next* button.

> Hint: The base path has been chosen  carefully to avoid URI rewriting and simplify this first example. You always have to be careful with the exposed URI and back end URI and adopt strategy to avoid URI rewriting or if not possible to reduce the work required to do this mapping. The worse case is to have a specific URI for each combinations VERB + PATH.

![Designer Specify quote api](./images/designer-specify-quote-api.png)

Keep the default value for CORS and using a client id to secure the API, click *Next* button.

![Designer quote api cors settings](./images/designer-quote-api-cors.png)

Click on the Edit *API button*.

![Designer edit api ](./images/designer-edit-api.png)

Before testing it, in the development environment, let's review what has been created under the cover. The Designer can be considered in certain ways a Swagger (Open API) editor.

Let's see first the API Setup part. Notice that the Schemes supported by default is HTTPS, API Connect does not support HTTP scheme for security reason. Some specifications such as OAuth specifications do require the use of HTTPS scheme anyway.

The host field has been set to $(catalog.host). This indicates where the API is deployed and it is dependent of where we deploy it, so it depends of the catalog, hence why this value for this variable.

![Designer Quote-api info part ](./images/designer-quote-api-info-part.png)

A quick look at the Security Definitions and Security information, which are standard information within an Open API document shows that the API is as expected protected using an API Key, client-id only.

We see that there are 2 paths, /extquote (one verb, GET) and /quote (2 verbs GET and POST).

Now let's see the Properties section, there is a property called target-url.
Properties is a very important concept. IT allows the definition of any variable  for each catalog. The target-url is by convention a variable to indicate the back-end url. In our case, we are going to adjust it to http://SampleJAXRS20-aw.eu-gb.mybluemix.net/loanmgt/resources. For now, we just use the default value, because we do not care of other catalogs than Sandbox. Click *Save* button.

![Designer Quote api properties](./images/designer-quote-api-properties.png)

Before testing we have one small adjustment to perform. The back end URL invoked, and we are going to use the target-url just set.

We go in the Assembly Panel, and click on the Invocation policy. The panel with the properties is displayed on the right.
> Hint: For compatibility of the gateway aspects, here delete the invoke policy and add it again. The choice here is based on which gateway type do we use. In our case, we use the new one, referred as DataPower API Gateway.

We change the value to $(target-url)$(request.path)$(request.search) and click *Save* button.

![Designer Quote api invoke](./images/designer-quote-api-invoke.png)

We can test the API which is available in the local Sandbox catalog with a generated auto product. We ensure that the API is running. If it stopped start it, so it goes in the running state.

![Designer Start API](./images/designer-run-API.png)

In a terminal type
 `curl -v -k -H "accept: application/json" -H "content-type: application/json" -H "x-ibm-client-id: c920f9c18395e6ecb3f15375a74fe8be" "https://localhost:9444/localtest/sandbox/loans/v1/quote?loanAmount=10000&annualInterestRate=1.1&termInMonths=3"`

You should get as before when accessing the back end API directly:
{"loanAmount":10000,"annualInterestRate":1.1,"termInMonths":3,"monthlyPaymentAmount":3339.4463108727305}

Before moving on, let's discuss some debugging techniques.

In order to do this, we are introducing a few errors and see what can we do to handle them and how to understand them.

Using the wrong client-id:
{"httpCode":"401","httpMessage":"Unauthorized","moreInformation":"Invalid client id or secret."}
This is situation is pretty clear. Get an unauthorized message.
One way to get a little bit more information is to use the -v option with curl. This will show you the headers sent and received, the TLS session information, etc ...

Now let's use a wrong host or URI for the back end.

![Trouble shoot 1](./images/troubleshoot-wrong-uri-1.png)

No information whatsoever!

Let's use the  -v option.

![Trouble shoot 2](./images/troubleshoot-wrong-uri-2.png)

Now we see that there was a 500 error. This is better. We do not see any root cause, there is no  problem with the plan (still 92 calls possible). It is not clear that the back end URI is wrong. So let's see the logs from the Gateway itself. We know that we are running DataPower as a docker container. So let's get the container id by issuing `sudo docker ps`, then now we can check the logs of the gateway using the `sudo docker logs -f <gateway-container-id>`. It becomes very clear that the error is the URL...

![Trouble shoot 3](./images/troubleshoot-wrong-uri-3.png)

> **Hint:** You can determine the port mapping for the gateway container and derive from it the  gateway web console knowing that the default internal port for the web UI is 9090. Issue the command `sudo docker port <gateway-container-id>`

![Trouble shoot 4](./images/troubleshoot-wrong-uri-4.png)

You can then access the console at https://localhost:9091/, the default uid/pwd is admin/admin.

![Trouble shoot 5](./images/troubleshoot-wrong-uri-5.png)

Let's fix the URI before publishing the API to the remote manager since we are happy now that the API is correctly working.

The API is definition is complete. We need now to add the Product and publish it and then we are ready to test our Quote API before publishing it to the remote Manager.

# Step 3 - Creating and publishing a Product

To create a product, click on the Develop icon on the navigation panel (left). Then click on the *Add* button and select Product.

![Designer Add product](./images/design-add-product.png)

Select *New product* button, and *Next* button.

![Designer New product](./images/designer-new-product.png)

Enter the following information:
* Title: Quote Management Product
* Summary: Includes the Quote API

Click on *Next* button

![Designer New product Information](./images/designer-new-product-info.png)

Select the Quote API by clicking on the check box and the click *Next* button.

![Designer New product Select API](./images/designer-new-product-selectapi.png)

Change or adjust the according your requirements plan and then click on *Next* button.

![Designer New product Select plan](./images/designer-new-product-plan.png)

Change or adjust the visibility or subscribability according your requirements plan and then click on *Next* button.

![Designer New product Select visibility](./images/designer-new-product-visibility.png)

click on *Edit Product* button.

![Designer New product Done](./images/designer-new-product-done.png)

We want to publish the API on the remote manager. So first, we start to add this manager to the Designer so we can choose where we want to deploy the product. We click on the *Switch cloud connection* link at the top of the window and then click on *Add Another Cloud* button. Enter the URL of the remote manager, in my case, https://manager.159.8.70.38.xip.io, then enter the credentials to access the organization you work with.

We publish the API, by clicking on the Develop icon, then clicking on the ... close to the new product and select Publish.

![Designer Quote product publish](./images/designer-quote-product-publish.png)

Then click on the *Publish* button.

 ![Designer Quote product publish done](./images/designer-quote-product-publish-done.png)

We can check on the remote Manager that the Product containing the Quote API has been correctly published.

![Designer Quote product publish remote](./images/designer-publish-product-remote.png)

# Step 4 - Consumer Experience

>Summary: In this step, you will learn the consumer experience for APIs that have been exposed to your developer organization. You login as a developer to register your application and then subscribe to the product just published and then test the API included in the product. We are referring to the Portal that is associated with the "remote" API Connect Cloud.

## Open the Portal login page
You can get the URL of the portal associated to a catalog in the settings of this catalog.

> Toto

 1. Go to the API Manager screen, in my case, https://manager.159.8.70.38.xip.io.
 2. Navigate to the Dashboard section and click on the Sandbox catalog tile.
 3. Choose the Settings tab, followed by the Portal option.
 4. Click on the Portal URL link to launch the Developer Portal
![Launch Portal](./images/launch-portal.png)
 5. Click on **API Products** to explore the available APIs

## Register an Application as a developer

Let's now subscribe to the Product. You will log into the portal as a user in the application developer role, then register an application that will be used to consume APIs.

If you have not created a developer account, you will need to use the **Create an account** link to do so now.

![Create users](./images/apic-portal.png)

 1. Enter in your account information for the developer account. This must be a different email address than your Bluemix account. Click **Create New Account** once all the requisite data in the form has been filled out.

 1. A validation email will be sent out to the email address used at sign up. Click on the validation link and then you will have completed the sign up process and will be authenticated into the page.

 1. Login into the developer portal as an application developer using your developer credentials.

 2. Click the Apps link, then click on the **Create new App** link.

 3. Enter a title and description for the application and click the Submit button.

 >Title: Mobile App Consumer

 >Description: Test Application for the various API products

 >OAuth Redirect URI: < leave blank >

We need to capture the Client Secret and Client ID in a text editor for later use by our test application.

  1. Select the Show Client Secret checkbox next to Client Secret at the top of the page and the Show checkbox next to Client ID.

![Register app](./images/apic-registerapp.png)

  2. **Copy Client Secret and Client ID in a text editor**

## Subscribe to a Plan for the "QuoteMgmt" product

In this section, we will subscribe to a plan for the "QuoteMgmt" using the Mobile App Consumer application.

  1. Click the ```API Products link.```
  2. Click the QuoteMgmt (v1.0.0) API product link.

You will be directed to the Product page which lists the available plans for subscription.

  1. Click on the **Subscribe** button under the ***Default plan***.
  2. Select the **Mobile App Consumer** toggle and click the **Subscribe** button.

The MobileApp Consumer application is now subscribed to the **Default plan** for the QuoteMgmt product.

## Test QuoteMgmt APIs from the Developer Portal

In this section, we will use the developer portal to test Quote Management API REST API. This is useful for application developers to try out the APIs before their application is fully developed or to simply see the expected response based on inputs they provide the API. We will test the **Quote Management API REST** API from the developer portal.

1. Click the **Quote** link on the left-hand navigation menu and then expand the GET /quote path by clicking on the twisty next to the path.

![Test app](./images/apic-testapidevportal.png)

1. Scroll down to the Try this operation section for the GET /quote path. Enter your Client ID and your Client secret and click the Call Operation button
2. Scroll down below the Call operation button. You should see a 200 OK and a response body as shown below.

![Test app](./images/apic-testapidevportalcall.png)

# Step 5 - Invoke the API

Now that you have browsed the API Portal and registered / tested the API’s that **Quote** is providing, it’s time to test them out from a real application.

Sample code (snippets) are provided from developer portal for different language (cUrl, Ruby, Python, PHP, Javascript, Java, Go, Swift) .

  1. Login into the developer portal as an application developer using your developer credentials.
  2. Click the **API Products link**
  3. Click the **Quote (v1.0.0)** API product link.
  4. Click on **Quote** API in the left panel
  5. Now, you can discover all operations with their properties and on the right hand side sample code.
  1. On the right hand side you'll see the ***cuRL** expression
  1. Copy it into your text editor window replacing **REPLACE_WITH_CLIENT_ID** and **REPLACE_WITH_CLIENT_SECRET** with your client id and your client secret saved from the prior step
  2. Remove ***"filter"*** parameter in the url the result is like this :

  ```
curl --request GET \
  --url 'https://api.eu.apiconnect.ibmcloud.com/BLUEMIXID-BLUEMIXSPACE/sb/loanmgt/resources/loans/v1/quote?loanAmount=10000&annualInterestRate=1.1&termInMonths=36' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header 'x-ibm-client-id: REPLACE_WITH_CLIENT_ID'
```

3. Copy and try it into your terminal windows

If all is OK, you should see the result of the quote in JSON format.

# Step 6 - Analytics

1. Return to the Bluemix API Manager screen.
2. Navigate to the Dashboard section and click on the **Sandbox** catalog tile.
3. Click on your **Quote** API and you can see number of subscriptions to you API.

![Analytic screen](./images/apic-analytics.png)

4. To see analytic information, click on the analytic icon.
![Analytic icon app](./images/apic-analyticicon.png)

5. Now you can navigate to the Analytic dashboard to show analytic informatios for your API
6. You can show

![Analytic icon app](./images/apic-analyticdashboard.gif)

1. Click on the ```Sandbox``` catalog tile
2. From the ```Sandbox``` catalog configuration screen, click on the ```Analytics``` tab.
 ![Analytic screen](./images/analytics-tab.png)

3. The default dashboard gives some general information like the 5 most active Products and 5 most active APIs. This information is interesting, but we can see much more information by customizing the dashboard. Add a new visualization by clicking on the ```+ Add Visualization icon.```

 ![Analytic screen](./images/analytics-add-visualization.png)

4. This will bring a list of some of the standard visualizations. You can then type in a string to filter through visualizations or use the arrows to page through the list.
5. Add the API Calls visualization to the dashboard by simply clicking on it. The new visualization will be added to the bottom of our dashboard.
 ![Analytic screen](./images/analytics-add-visualization-item.png)
5. Scroll down to find the new visualization. You can adjust the size by clicking and dragging the border from the lower right. Additionally, you can adjust its position by clicking and dragging the box to where you want it.
 ![Analytic screen](./images/analytics-add-visualization-new.png)
6. Feel free to play around with the other visualizations by adding them to the Dashboard. You can also save the dashboard by clicking on the Save Dashboard button:
 ![Analytic screen](./images/analytics-save-dashboard.png)

# Step 7 - Create a SOAP API
This is very similar to the creation of a REST API. The big difference is that we use a WSDL. The explanations will be short. We assume that we are still using the Manager (remote server in Bluemix), this would be the same user experience with the toolkit.

1. Download the WSDL for the Branch SOAP Service, you can find it
 [here](./materials/step7/BranchSOAP.wsdl).
 You can also get the WSDL at the following URL https://addressmanagementwebservice.eu-gb.mybluemix.net/branches/Branches?WSDL

1. In the Draft area, in the APIs menu, click on Add and select API from a SOAP service

 ![SOAP API Create](./images/apic-soap-create.png)

1. Select the BranchSOAP.wsdl file to load

![SOAP API Load](./images/apic-soap-create-load.png)

and click Done.

1. Rename the API to **Branch SOAP** by changing the title.

1. Add this new SOAP API to the existing BranchMgmt product

![SOAP API Add to Product](./images/apic-soap-create-addtoproduct.png)

Select The BranchMgmt product.

![SOAP API Add to BranchMgmt Product](./images/apic-soap-addtoBranchProduct.png)

1. The BranchMgmt product now contains two APIs

![SOAP API BranchMgmt Product](./images/apic-soap-product-with-two-APIs.png)

1. Publish the Product into the Sandbox catalog and test the getAllBranches operation in the Portal

![SOAP API Test](./images/apic-soap-test.png)


>**Note:** We did not use a Properties and did not change the endpoint for the Proxy policy in the assembly panel, because the WSDL does have the correct endpoint on the Secure Gateway in Bluemix. In reality, you would probably want to create a properties that will point to the right endpoint depending on the environment.

# Step 8 - Create a SOAP to REST API
>In this step, we are going to create a New API (blank), specify the REST interface (paths, verbs and parameters) and add the Service definition using the Branch.wsdl file from the previous step, and then in the assembly will perform the mapping. You will see that API Connect supports array of objects or arrays of arrays very easily. Notice that SOAP to REST in this context means that we have a SOAP back end and we expose it in REST JSON, hence SOAP to REST. We could have had a another view and call it REST to SOAP :-)

Click on Add, and select New API

![SOAP API REST Create](./images/apic-soap-rest-create.png)

Specify the following
> Title: Branch SOAP to REST

> Base path: /branch-s2r/v1

Then click on Create API button.

![SOAP API REST new](./images/apic-soap-rest-new.png)

Add it to the existing BranchMgmt product.

Since we do not have a Swagger in this case, we need to define the various definitions for the interface manually and in particular for the response.
The SOAP response is as follow:
```
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
   <soap:Body>
      <ns2:getAllBranchesResponse xmlns="http://ws.ad.ibm.com/branches/getBranchById" xmlns:ns2="http://ws.ad.ibm.com/branches/">
         <ns2:branch>
            <ns2:id>123</ns2:id>
            <ns2:type>atm</ns2:type>
            <ns2:phones>
               <ns2:type>personal</ns2:type>
               <ns2:number>978-899-3445</ns2:number>
            </ns2:phones>
            <ns2:phones>
               <ns2:type>professional</ns2:type>
               <ns2:number>978-899-3446</ns2:number>
            </ns2:phones>
            <ns2:address>
               <ns2:street1>600 Anton Blvd.</ns2:street1>
               <ns2:street2>Appt 1</ns2:street2>
               <ns2:zip-code>92626</ns2:zip-code>
               <ns2:city>Costa Mesa</ns2:city>
               <ns2:state>CA</ns2:state>
               <ns2:country>USA</ns2:country>
            </ns2:address>
            <ns2:options>color screen</ns2:options>
            <ns2:options>large screen</ns2:options>
            <ns2:onlineStatus>true</ns2:onlineStatus>
         </ns2:branch>
      </ns2:getAllBranchesResponse>
   </soap:Body>
</soap:Envelope>
```

In this step, we only will implement the getAllBranches operation.

We start by creating the definitions.
Looking a the SOAP message, we need to create: a branch, an address and a phone for the basic types and the following objects to implement the arrays: a phoneArray, an optionArray and finally a branchArray. From the soap message above it is pretty obvious to determine the properties associated to those definitions. We use string for all properties except the onlineStatus property which is a boolean.
 Go to the definitions section, click on the + sign on the right. Rename the new definition to branch, keep the type to object

![Create Branch definition](./images/branchdef1.png)

Change the new property-1 to id, specify the description, keep the type to string and specify a sample value.

![Adding a property](./images/branchdef2.png)

Repeat the same for the other properties.
For example, here is the phone definition: ![phone definition](./images/branchdef3.png)

For the arrays, this is the same principle, except that we create an object of type array, and then select the type of items in the array. Below the phoneArray object

![phoneArray definition](./images/branchdef4.png)

When you have created all the definitions, you should have something similar to this.

![all definitions](./images/branchdef5.png)

We can now create the path. In the Paths section, click on + sign on the right. Rename the path to /branches., expand the GET operation, provide an Operation ID, provide information on the path in the Description section. For the response, in the 200 status code section, specify the schema of the response, in our case, select branchArray.

![path definitions](./images/branchdef6.png)


Add the Service definition by uploading the BranchSOAP.wsdl file, click on the + icon close to the Services definition

![SOAP API REST new](./images/apic-soap-rest-service-def.png)

You can see the details of the Service, click on Done.

![SOAP API REST new service](./images/apic-soap-rest-service-def2.png)

Now click on the Assemble menu.
Make sure that you have the DataPower Gateway policies selected

![SOAP API REST WDP Policies](./images/apic-soap-rest-assembly-wdp.png)

Remove the Invoke policy, by clicking on the Trash icon when you hoover your mouse on the Invoke policy.

![SOAP API REST remove invoke](./images/apic-remove-policy.png)

Drag and drop the getAllBranches Web Service Operations Policy from the palette.

![SOAP API REST remove invoke](./images/apic-soap-rest-service-policy.png)

This automatically generates all you need to do the mapping.

![SOAP API REST remove invoke](./images/apic-soap-rest-assembly-generated.png)

We just need to complete the mapping for both request and response.
The first Map policy will convert the JSON request to a SOAP request, the second will convert the SOAP response into a JSON response. With the getAllBranches operation, there is a particularity. The request does not take any parameter. So there is not explicit mapping to perform. We are just going to open the first Map policy to understand what is happening. Click on the first Map policy, this opens the mapping editor. You can see on the right, the SOAP message, and nothing on the left. We do not need to specify an input in this case. The SOAP message contains everything needed, i.e. The SOAP headers, body, operation and setting the two specific HTTP Header SOAP action and the content-type for the request.

Mapping the response
![Response mapping](./images/restTOsoapMapOutput.png)

The endpoint for the back end SOAP service is the same as in Step 8: https://addressmanagementwebservice.eu-gb.mybluemix.net/branches/Branches.

# Step 9 - Create a Cloudant service

In order to store our data used by our API, we will need a persistent storage. To do so, we will use a Cloudant NoSQL database, a JSON document oriented store, compatible with CouchDB.

You can use a existing Cloudant service or create an instance of the service Cloudant DB.

1. Go to the Bluemix Catalog, create an instance of the service Cloudant NoSQL DB.

2. Search for **Cloudant** in the catalog

1. Select the free **Lite** plan

2. Give it a name such as **cloudant-db**.

3. Launch the Cloudand Dashboard. A new tab should open automatically with the list of databases.

4. Create a new database with the button on top right corner. Call this database : **test**. Make sure to use this name as this is expected by the persistence layer of API Connect.

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


# Step 10 - Create a LoopBack application

API Connect comes with a developer toolkit. This toolkit provides an offline graphical user interface named API Designer for creating APIs, the LoopBack framework for developing REST applications, a local unit test environment that includes a Micro Gateway for testing APIs, and a set of command line tools for augmenting the development toolset and assisting devops engineers with continuous integration and delivery.

1. Get help on the **apic** command set:
  ```
  apic -h
  ```

The developer toolkit provides an integrated development environment for developing APIs and applications that use the LoopBack framework.

To create a new LoopBack project, use the command apic loopback; then use the apic edit command to edit the project in the API Designer.

>**Note**: When working with the toolkit always be careful of where you are located on your file system. The working directory from where the apic command are started will be considered as the root of the loopback projects and products/APIs you are working at some point. Cautious must be taken on how you organize the directories. It also must take in considerations that at some point you will want to source control some of the generated files (such as the yaml files for example) in a Source Control Management system such as github.


1. Create an API Connect LoopBack application.

  ```
  $ mkdir -p <your-favorite-working-dir>/apic/myfirstproject
  $ cd <your-favorite-working-dir>/apic/myfirstproject
  $ apic loopback
  ```

 Next you will be asked to supply the name of the directory where the application will be created. Enter **Customer**

  ```
  What's the name of your application? Quote
  ```

1. LoopBack will default the project directory name to the name of the application.

1. Press the ***Enter*** or ***Return*** key to accept the default value of inventory.

1. Next you will be asked to select the type of application. Use the arrow keys to select the **empty-server** option and press the ***Enter*** or ***Return*** key.

```
❯ empty-server (An empty LoopBack API, without any configured models or datasources)
```

1. At this point, the project builder will install the core dependencies for our Node.js application.

  ```
  ? Please review the license for API Connect available in /usr/local/lib/node_modules/apiconnect/LICENSE.txt and select yes to accept. yes arrow keys)
  ? What's the name of your application? Customer
  ? Enter name of the directory to contain the project: Customer
  ? What kind of application do you have in mind? empty-server (An empty LoopBack API, without any configured models or datasources)
  ```

1. Change directory to your application directory

  ```
  cd Customer
  ```

### Create a Data source Connector to Cloudant

The data source is what allows the API to communicate with the backend data repository. In this case we will be using Cloudant to store the data item information.

There are two parts to this. First is the definition of how to connect to the backend system. The second is downloading the actual loopback connector for Cloudant.

In your terminal ensure that you are in the **Customer** directory.

  ```
  cd Customer
  ```

In your terminal, type:

 ```
 apic create --type datasource
 ```

 The terminal will bring up the configuration wizard for our new data source for the item database. The configuration wizard will prompt you with a series of questions. Some questions require text input, others offer a selectable menu of pre-defined choices.

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


> **Note**:
By typing Y (Yes) to the question Install loopback-connector-cloudant, the Cloudant Connector will be downloaded and saved to your project automatically.

>This will create a connection profile in the ~/Customer/server/datasources.json file. It is effectively the same as running the following to install the connector:

>npm install loopback-connector-cloudant --save

>For more information on the LoopBack Connector for Cloudant, see: https://www.npmjs.com/package/loopback-connector-cloudant


>Note : You can create an api directly from a existing web service from the wsdl. Create a SOAP API definition from a WSDL definition file, or a .zip file that contains the WSDL definition files for a service with the following command: ```apic create --type api --wsdl filename```

>Note: You can create an API or Product from an Open API (Swagger 2.0) template file by using the '--template template-name' option.


# Step 11 - Manage your API in API Designer

1. Launch API Connect Designer

  ```
  apic edit
  ```

  If the designer started correctly, a webpage will automatically opens and the terminal will show a message similar to this one:

  ```
  Express server listening on http://127.0.0.1:9000
  ```

1. Click **Sign in with Bluemix**. If you're already sign in with Bluemix, you'll be automatically signed into the designer.

1. The designer opens into the APIs section showing the API definition we created from the command line.

![APIC Screenshot](./images/apic-firstscreen.png)

###Create a Model for the **Customer** items

In this section, you will define the item data model for our **Customer** API and attach it to the Cloudant datasource. LoopBack is a data model driven framework. The properties of the data model will become the JSON elements of the API request and response payloads.

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


# Step 12 - Test your API

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

1. Congratulations you successfully tested your API.

# Step 13 - Using OAuth to protect your API
OAuth - Open Authorization is a great and modern security mechanism. It is used for two main cases: authentication and authorization. The very nice thing with OAuth is that there is a full control on the life of the token (client side or server side), it is possible to refresh the token, meaning being able to recreate an access token without the need of re-entering the user's credentials, it is possible to perform authorization with the notion of scope, it is possible to authorize a third party to access your data without authenticating (or using your credentials) to this third party, it is possible to revoke the token, a lot of very good things. The only limitations was the content of the token regarding the identity of the parties, this is basically a UUID, but this limitation is corrected with OpenID Connect. One difficulty with OAuth is coming from its flexibility, it is so flexible that it implies a lot of various ways to use OAuth, choices to use different grant types, the way to extract the identity, to perform authentication, to control the revocation and introspection, the way the scope and the consents are handled, the redirection, etc …

> **Note**: In this lab, we do not explain how to propagate the user information with a JWT token, it will be done in another version of this lab. But this is an important question, and there are different ways to get user information like having the back end performing a call back with the OAuth token to get information.

In this lab, we start with a very simple case, but still very useful: the use of the Password flow which really is the Resource Owner Password Credentials grant type in OAuth terminology. It is easy because it is 2-legged, for simplicity we also use Basic Authorization to extract identity, the user will be authenticated against an LDAP Server. We do use API Connect as the OAuth provider, notice that it is also possible to use API Connect with an external OAuth provider.

This configuration requires two steps:
1. Creating an OAuth API
1. Configuring the API to be protected to use this OAuth API


* Creation of the OAuth API
From the API page, click on Create OAuth 2.0 Provider API.
![Create OAuth API menu](./images/createOAuthAPIMenu.png)

For the title enter *Banking Mgt OAuth Provider* for example, and change the version to add a version number which is a good practice, for example /banking-mgt-oauth-provider/v1.
![Create OAuth API Title](./images/createOAuthAPITitle.png)


 Enter the following information:

| Field name               | Value           |
|:-------------------------|:---------------:|
| Client type              | Confidential    |
| Scope name               | calculate_loans |
| Grants                   | Password        |
| Identity extraction      | Basic           |
| Authentication           | User registry   |
| User registry            | MyLDAP          |
| Authorization            | Default form    |

Only one scope, so you can remove the other ones.

For now, unselect Enable refresh tokens, Enable revocation, and Enable token introspection. We will play with those options later.


TO BE COMPLETED

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
- [Royal mail portal](https://developer.royalmail.net/node/2757)


[bmx_dashboard_url]:  https://console.eu-gb.bluemix.net/
[bmx_catalog_uk_url]: https://console.eu-gb.bluemix.net/catalog/


FAQ
Doe