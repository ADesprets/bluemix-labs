![](./images/openwhisklogo.png)

# OpenWhisk


###What is Serverless Computing?

Serverless computing refers to a model where the existence of servers is simply hidden from developers. I.e. that even though servers still exist developers are relieved from the need to care about their operation. They are relieved from the need to worry about low-level infrastructural and operational details such as scalability, high-availability, infrastructure-security, and so forth. Hence, serverless computing is essentially about reducing maintenance efforts to allow developers to quickly focus on developing value-adding code.

Serverless computing encourages and simplifies developing microservice-oriented solutions in order to decompose complex applications into small and independent modules that can be easily exchanged.

Serverless computing does not refer to a specific technology; instead if refers to the concepts underlying the model described prior. Nevertheless some promising solutions have recently emerged easing development approaches that follow the serverless model – such as OpenWhisk.

###What is OpenWhisk?

OpenWhisk is a cloud-first distributed event-based programming service. It represents an event-action platform that allows you to execute code in response to an event.

OpenWhisk provides you with a serverless deployment and operations model hiding infrastructural complexity and allowing you to simply provide the code you want us to execute. It provides you with a fair pricing model at any scale, where we provide you with exactly the resources – not more not less – you need and only charge you for code really running. It offers a flexible programming model. incl. support for languages like NodeJS and Swift and even for the execution of custom logic via docker containers. This allows small agile teams to reuse existing skills and to develop in a fit-for-purpose fashion. It also provides you with tools to chain together the building blocks you have developed. And the best: It is open and can run anywhere to avoid any kind of vendor lock-in.


**IBM Bluemix OpenWhisk** introduces a new way to build such solutions in the cloud. It provides a distributed compute service to execute application logic in response to events.

Our value proposition and what makes us different is:

-   OpenWhisk hides infrastructural complexity allowing developers to focus on business logic

-   OpenWhisk takes care of low-level details such as scaling, load balancing, logging, fault tolerance, and message queues

-   OpenWhisk provides a rich ecosystem of building blocks from various domains (analytics, cognitive, data, IoT, etc.)

-   OpenWhisk is open and designed to support an open community

-   OpenWhisk supports an open ecosystem that allows sharing microservices via OpenWhisk packages

-   OpenWhisk allows developers to compose solutions using modern abstractions and chaining

-   OpenWhisk supports multiple runtimes including NodeJS, Swift, and arbitrary binary programs encapsulate in Docker containers

-   OpenWhisk charges only for code that runs


The OpenWhisk model consists of three concepts:

-   **trigger**, a class of events that can happen,

-   **action**, an event handler -- some code that runs in response to an event, and

-   **rule**, an association between a trigger and an action.

Services define the events they emit as triggers, and developers define the actions to handle the events.

The developer only needs to care about implementing the desired
application logic - the system handles the rest.

##Getting started 

A few ***important*** notes before you start:

If it is the first time you use Bluemix you have to set your namespace

1.  Go to <https://console.ng.bluemix.net>

2.  Login to Bluemix with your account

3.  Click on icon in the top-right corner

4.  Verify the region (US South) and organization (your e-mail)

5.  Click on Manage Organizations

6.  Click on the Create a Space (on the left)

7.  Put something short and easy to remember

In order to use OpenWhisk you need to sign-up first. It was part of your
pre-lab assignment.

1.  Open a browser window

2.  Navigate to <https://new-console.ng.bluemix.net/openwhisk/>

3.  Log-in with your account

4.  Navigate to Configure CLI

5.  Follow step 2 (you do not need to perform step 1 and 3) listed
    there
    
    
    >Note: When you perform step 2 you will see a auth key & secret
    looking like this:
    xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx**:**yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
    
    The part left of the colon is your auth key.
    The part right of the colon is your auth secret.
    
    **As you will need both later leave the browser open.**

##Working with the CLI

The CLI (command line interface) allows you to work with OpenWhisk’s
basic entities, i.e. to create rules, actions, and triggers. Hence,
let’s learn how to work with the CLI.

Actions
-------

*Actions* are small stateless pieces of code that run on the OpenWhisk platform.

Your first JavaScript action
----------------------------

An action can be a simple JavaScript function that accepts a JSON object and returns a JSON object.

First, use the preinstalled Atom editor to create a file called
`hello.js` with the following content:

    function main() {
        return { message: 'Hello world' };
    }

Save the file to your home directory.

Next, open a terminal window and create an OpenWhisk action called
`hello` referencing the function in hello.js:

    $ wsk action create hello hello.js
    ok: created action hello

Notice that you can always list the actions you have already created
like this:

    $ wsk action list
    actions
    hello                                        private

To run an action use the `wsk action invoke` command.

A blocking invocation waits until the action has completed and returned a result. It is indicated with the `--blocking` option (or `-b` for short):

    $ wsk action invoke --blocking hello
    ok: invoked hello with id dde9212e686f413bb90f22e79e12df74
    response:
    {
        "result": {
            "message": "Hello world"
        },
        "status": "success",
        "success": true
    }

The above command outputs two important pieces of information:

-   the activation id (`dde9212e686f413bb90f22e79e12df74`)

-   the activation response which includes the result

The activation id can be used to retrieve the logs or result of the
invocation at a future time. In case you forget to record the activation
id you can get a list of activations at any time:

    $ wsk activation list
    activations
    dde9212e686f413bb90f22e79e12df74             hello
    eee9212e686f413bb90f22e79e12df74             hello                                   

Notice that the list of activation ids is ordered with the most recent
one first.

To obtain the result of a particular action invocation enter (note that you need to replace the activation id with the id you have received during the previous step):

    $ wsk activation get dde9212e686f413bb90f22e79e12df74
    […]
    response:
    {
        "result": {
            "message": "Hello world"
        },
        "status": "success",
        "success": true
    }
    […]

You can clean up by deleting the action:

    $ wsk action delete hello
    ok: deleted hello

To check whether the action was deleted:

    $ wsk list
    entities in namespace: default
    packages
    actions
    triggers
    rules

Passing parameters to actions
-----------------------------

Actions may be invoked by a number of named *parameters*. Change (and save) your JavaScript function as follows:

    function main(msg) {
        return { message: 'Hello, ' + msg.name + ' from ' + msg.place };
    }

Again, create the action:

    $ wsk action create hello hello.js
    ok: created action hello

You can pass named parameters as a JSON payload or with the CLI:

    $ wsk action invoke -b hello -p name 'Bernie' -p place 'Vermont' --result
    {
        "message": "Hello, Bernie from Vermont"
    }

Notice the use of the --result parameter (available for blocking
invocations only) to immediately print the result of the action
invocation without the need of an activation id.

Binding parameters to actions
-----------------------------

Recall that the `hello` action above took two parameters: the name of a person, and the place where they are from.

Rather than passing all of the parameters to an action every time, you can *bind* certain parameters.
Let’s bind the place parameter above so we have an action that defaults to the place "Vermont, CT":

    $ wsk action create helloBindParams hello.js --param place 'Vermont, CT'
    ok: created action helloBindParams

    $ wsk action invoke -b helloBindParams --param name 'Bernie' --result
    {
        "message": "Hello, Bernie from Vermont, CT"
    }

Notice that we did not need to specify the place parameter when invoking the action. Moreover, bound parameters can still be overwritten by specifying the parameter value at invocation time.

Sequencing actions
------------------

You can also create a *composite* action that chains together a sequence of actions.

This time we will use a set of actions that are shipped with OpenWhisk in a package called `/``whisk.system``/util`. One way to access the actions in this package is by binding to them (you could alternatively access the packages directly). Bindings create a reference to the given package in your namespace.

The advantage is that they allow you to access actions by typing myUtil/actionName instead of /whisk.system/util/actionName every time. Just run the following command:

    $ wsk package bind /whisk.system/util myUtil
    ok: created binding myUtil

You now have access to the following actions:

-   myUtil/cat: Action to transform lines of text into a JSON array

-   myUtil/head: Action to return the first element in an array

-   myUtil/sort: Action to sort an array of text

Let’s now create a composite action that is a sequence of the above
actions, so that the result of one action is passed as arguments to the next action:

    $ wsk action create myAction --sequence myUtil/cat,myUtil/sort
    ok: created action myAction

The composite action above will convert some lines of text to a JSON
array and sort these.

Before invoking the composite action let’s use the editor again and
create (and save) a text file called mytexte.txt with a few lines of
text:

    Over-ripe sushi,
    The Master
    Is full of regret.

Now, invoke the action:

    $ wsk action invoke -b myAction -p payload "$(cat mytexte.txt)" --result
    {
        "length": 3,
        "lines": [
            "Is full of regret.",
            "Over-ripe sushi,",
            "The Master"
        ]
    }

You can see that the lines of text were sorted.

Triggers and Rules
------------------

*Triggers* represent a named “channel” for a stream of events.

Let’s create a trigger to send user location updates:

    $ wsk trigger create locationUpdate
    ok: created trigger locationUpdate

You can check that you created the trigger by listing available
triggers:

    $ wsk trigger list
    triggers
    locationUpdate         private

So far we have only created a named channel to which events can be
fired.
Let’s now fire a trigger event by specifying the trigger name and
parameters:

    $ wsk trigger fire locationUpdate -p name 'Donald' -p place 'Washington, D.C.'
    ok: triggered locationUpdate with id 11ca88d404ca456eb2e76357c765ccdb

Events you fire to the `locationUpdate ` trigger currently do not do
anything. To be useful, we need to create a rule that associates the
trigger with an action.

Using rules to associate triggers and actions
---------------------------------------------

***Rules*** are used to associate a trigger with an action. Hence, every
time a trigger event is fired, the action is invoked together with the
events’ parameters.

Let’s create a rule that calls the hello action whenever a location
update is posted.

Create and enable the rule; required parameters are the name of the
rule, the trigger, and the action:

    $ wsk rule create myRule locationUpdate hello
    ok: created rule myRule

    $ wsk rule enable myRule
    ok: rule myRule is activating

Now, every time we fire a location update event, the hello action will be called with the corresponding event parameters:

    $ wsk trigger fire locationUpdate -p name 'Donald' -p place 'Washington, D.C. '
    ok: triggered locationUpdate with id 12ca88d404ca456eb2e76357c765ccdb

We can check that the action was really invoked by checking the most
recent activations:

    $ wsk activation list hello
    activations
    12ca88d404ca456eb2e76357c765ccdb             hello
    11ca88d404ca456eb2e76357c765ccdb             hello

Notice that the use of the optional argument hello filters the result so that only invocations of the hello action are being displayed.

Again, to obtain the result of the particular action invocation enter
(note that you once again need to replace the activation id with the id you have received during the previous step):

```
$ wsk activation result 12ca88d404ca456eb2e76357c765ccdb
{
    "result": "Hello, Donald from Washington, D.C."
}
```

We can finally see that the hello action received the event payload and returned the expected string.

##Mobile Weather Demo
===================

In this lab, you will use OpenWhisk to obtain the weather forecast for your location.

Prerequisites
-------------

You will need the following to complete this lab:

-   Your OpenWhisk credentials (Should still be visible in the browser window you left open)

-   An installation of the OpenWhisk CLI tool, configured with your
    OpenWhisk credentials (Already configured on the demo system)

-   A valid Weather.com API key (key: ee2de930b939e43beaacd2eac6d641de)

-   A valid Watson text analytics API username and password (username: 5a11ff41-670e-446d-8b1c-3d2d0d630cd7 ; password:
    UWGVlscxa0d6)

Get the weather forecast
------------------------

Now that you are able to use the OpenWhisk SDK to invoke an action from a mobile app, let’s modify the app to get the weather forecast for the current location.

OpenWhisk offers a number of packages that provide integration with
external services.

Enter the following in a terminal:

    $ wsk package list /whisk.system
    packages
    /whisk.system/samples                        shared
    /whisk.system/weather                        shared
    /whisk.system/system                         shared
    /whisk.system/github                         shared
    /whisk.system/util                           shared
    /whisk.system/watson                         shared
    /whisk.system/slack                          shared
    /whisk.system/cloudant                       shared
    /whisk.system/alarms                         shared

The `/``whisk.system``/weather` package looks promising. Let’s see what is in it.

Enter the following in a terminal:

    $ wsk package get --summary /whisk.system/weather
    package /whisk.system/weather: Services from The Weather Company
       (params: apiKey)
     action /whisk.system/weather/forecast: Weather.com 10-day forecast

And then the following:

`$ wsk action get --summary /whisk.system/weather/forecast`\
`action /whisk.system/weather/forecast: Weather.com 10-day forecast`\
`    (params: latitude longitude apiKey)`

Obviously the package has a `forecast` action which seems to be what you need. The description of the `/``whisk.system``/weather` package reveals that the `forecast` action requires an apiKey. To avoid passing in the apiKey every time, you can again create a package binding that includes the Weather.com API key.

Enter the following in a terminal:

    $ wsk package bind /whisk.system/weather myWeather -p apiKey ee2de930b939e43beaacd2eac6d641de
    ok: created binding myWeather

You can now test invoking the forecast action passing in some latitude
and longitude parameters.

Enter the following in a terminal:

    $ wsk action invoke -b myWeather/forecast -p latitude 40 -p longitude 3

Notice that you do not have to pass in the apiKey since you are invoking the `forecast` action with your `myWeather` package binding causing the action to inherit the parameters you set for the package. This will also be useful when you need to invoke the action from your mobile app and do not want have to embed the apiKey in your app.

Filter the weather forecast result
----------------------------------

You might have noticed that the weather forecast action returns a very long JSON result even though you only need a few fields of it. You can see the number of characters returned from the action in the status label at the bottom of the app.

Hence, let’s create an OpenWhisk action that filters out the unnecessary parts of the result. That way the data being sent to the app is significantly reduced since the action runs on the backend.

We are going to use existing filtering function written in swift being part of the iOS SDK.

Let’s download the starter app:

    $ wsk sdk install iOS

    You should now have an OpenWhiskStarterApp.zip file.
    Unzip this file:

    $ unzip OpenWhiskIOSStarterApp.zip

    $ cd OpenWhiskIOSStarterApp

Create the action by entering the following in a terminal:

    $ wsk action create filter FilterForecast.swift
    ok: created action filter

Now, create an action sequence consisting of the weather forecast and
filter actions:

    $ wsk action create --sequence myForecast myWeather/forecast,filter
    ok: created action myForecast

Test your new myForecast action by invoking it from the command line and
notice how much smaller the response is:

    $ wsk action invoke -b myForecast -p latitude 40 -p longitude 3

Now, when you invoke the `myForecast` action, the app will only receive
the filtered forecast data.

Translate the weather forecast to another language
--------------------------------------------------

Let’s now use the Watson translation service to translate the weather
forecast text to Spanish.

Recall that OpenWhisk offers a number of packages that provide
integration with external services.

Enter the following in a terminal:

    $ wsk package list /whisk.system
    packages
    /whisk.system/weather                                             shared
    /whisk.system/slack                                               shared
    /whisk.system/system                                              shared
    /whisk.system/util                                                shared
    /whisk.system/samples                                             shared
    /whisk.system/github                                              shared
    /whisk.system/watson                                              shared

This time `/whisk.system/watson` package looks promising. Again,
let’s see what is in it.

Enter the following in a terminal:

    $ wsk package get --summary /whisk.system/watson
    package /whisk.system/watson: Actions for the Watson analytics APIs
       (params: username password)
     action /whisk.system/watson/translate: Translate text
     action /whisk.system/watson/languageId: Identify language

And then the following:

   ```
   $ wsk action get --summary /whisk.system/watson/translate
   action /whisk.system/watson/translate: Translate text
   (params: translateFrom translateTo translateParam username password)
   ```

This time you will be using the `translate` action. The description of the`/whisk.system/watson` package above reveals that the `translate` action needs the Watson service’s username and password. 

As you already did with the weather package, you can create a package binding that includes these credentials.

Enter the following in a terminal:

    $ wsk package bind /whisk.system/watson myWatson -p username 5a11ff41-670e-446d-8b1c-3d2d0d630cd7 -p password UWGVlscxa0d6 -p translateParam forecasts -p translateTo es
    ok: created binding myWatson

The above command also binds a couple of additional parameters:
`translateTo` is set to translate the text to Spanish, and
`translateParam` is set to translate whatever is in the `forecast``s`
parameter when the action is invoked.

It’s a good idea to first test the `translate` action to make sure that the credentials are setup correctly:

    $ wsk action invoke -b myWatson/translate -p forecasts "Blue skies ahead."
    ok: invoked myWatson/translate with id beced1ae8d5e4e518f20fa62ce28fd54
    response:
    {
        "result": {
            forecasts": "Azul cielo antes."
        },
        "status": "success",
        "statusCode": 200
    }

You can now update your `myForecast` action sequence and add the
translate action to the end of the sequence.

    $ wsk action update --sequence myForecast myWeather/forecast,filter,myWatson/translate
    ok: updates action myForecast

If you now invoke the `myForecast` action you should see all the fields translated to French.

Go ahead and try it:

    $ wsk action invoke -b myForecast -p latitude 40 -p longitude 3

All the changes you have made have been on the backend, so there is no need to rebuild or even rerun your app. Hit the button in your app, and you should see the translated forecast.

Let’s recap what happens when you invoke the `myForecast` action:

-   The first action in the sequence, `myWeather/forecast` is invoked,
    which\
    calls a Weather.com API

-   The result of this API call is passed to the `filter` which strips
    out the parts of the forecast data. The `filter` action is written in Swift
    so you can write and debug it in Xcode before pushing the logic to the backend

-   Finally, the stripped down forecast data is passed to the\
    `myWatson/translate` action which calls the Watson APIs to translate the text

The filtering and aggregation of multiple API calls happens in the
backend and not in your app keeping your app light providing a
responsive user experience. And, aggregating these calls in the OpenWhisk backend also means you do not have to learn how to develop a complex backend application, or manage a scalable, highly-available backend platform.

Learning more
=============

Important resources:

-   Whisk on Bluemix (experimental program):\
    <https://new-console.ng.bluemix.net/openwhisk/>

-   Whisk Developer Center (focuses on our open-source project):\
    <https://developer.ibm.com/openwhisk/>

-   Support forum (primarily for our Bluemix offering):\
    [https://developer.ibm.com/answers/smartspace/bluemix](https://developer.ibm.com/answers/smartspace/bluemix/)

-   Support forum (primarily for our open-source project):\
    > <https://groups.google.com/d/forum/openwhisk>
