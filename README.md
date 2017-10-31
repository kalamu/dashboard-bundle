# Bundle kalamu/dashboard-bundle

[![Build Status](https://travis-ci.org/kalamu/dashboard-bundle.svg?branch=master)](https://travis-ci.org/kalamu/dashboard-bundle)

This bundle provide a configurable interface for users to build modulable content.
It's can be used to build responsive content, application dashbord and more.

## Installation

Install the bundle:

```sh
composer require kalamu/dashboard-bundle:~1.0
```

Register the bundle and the dependency in `app/AppKernel.php`:

``` php
    public function registerBundles()
    {
        $bundles = array(
            // [...]
            new Bazinga\Bundle\JsTranslationBundle\BazingaJsTranslationBundle(),
            new Kalamu\DashboardBundle\KalamuDashboardBundle(),
        );
```

Register de routing in `app/config/routing.yml`:

``` yaml
_bazinga_jstranslation:
    resource: "@BazingaJsTranslationBundle/Resources/config/routing/routing.yml"

kalamu_dashboard_api:
    resource: "@KalamuDashboardBundle/Resources/config/routing.yml"
    prefix:   /
```

Publish assets:

```sh
./bin/console assets:install
```

## How to use it ?

To use this bundle there is 3 key concepts:
* The context in witch we work
* The elements that compose the content
* The dashboard that is the main container


### The context
The contexts are used to organize and filter the elements that are available.
For exemple an application can use the dasboard for two purpuses: a dashboard
with personnal activity report and a shared public dashboard with gobal stats.

This two purpuses will maybe have common elements like todo task list, but somes
will have no sense in somes contexts. For exemple, an element for managing
personnal activity sould not be added in public shared dashboard.

For this reason, you can create multiple contexts and define the elements that
can be added in each context.

This defined in the `app/config/config.yml` :

``` yaml
kalamu_dashboard:
    contexts:
        personal_dashboard:
            types:
                cms_content:
                    standard:
                        - service.element.wysiwyg
                        - service.element.bare_text
                    media:
                        - service.element.image
                        - service.element.video
        global_dashboard:
            types:
                stats:
                    default:
                        - service.element.personnal_time
                        - service.element.number_due_tasks
                    project:
                        - service.element.project_calendar
                        - service.element.milestome
                        - ...
```

This configuration create 2 contexts `personal_dashboard` and `global_dashboard`.
In `personal_dashboard` there is one type of element `cms_content` that provide
4 element organised in categories `standard` and `media`.

Each element of a dashboard is a Symfony service. To enable it, you must report
the service name in the appropriate category.


### Create an Element

Like it's said, the elements are Symfony services. They must implements either
the `Kalamu\DashboardBundle\Model\AbstractElement` for a simple element or
`Kalamu\DashboardBundle\Model\AbstractConfigurableElement` if the element require
some sort of configuration.

Example of an element that show the `n` last tasks of an user. This element will
ask the user to define how many task must be reported on his dashboard.

``` php
use Kalamu\DashboardBundle\Model\AbstractConfigurableElement;
use Symfony\Bundle\TwigBundle\TwigEngine;
use Symfony\Component\Form\Form;

class UserDueTasks extends AbstractConfigurableElement
{

    public function getTitle()
    {
        return 'My lasts tasks';
    }

    public function getDescription()
    {
        return 'Display my last assigned tasks with they due time.';
    }

    public function getForm(Form $form)
    {
        $form->add("number", 'integer', [
            'label' => 'Number of task to show',
            'data'  => 10
        ]);
        return $form;
    }

    public function render(TwigEngine $templating){
        $number = $this->parameters['number'];

        $tasks = $this->theMagicOne($number); // Here you call your magic method that get the last '$number' tasks of the current user

        return $templating->render('AcmeAppBundle:Element:user_due_tasks.html.twig',
            ['tasks' => $tasks, 'number' => $number]);
    }

}
```

You must register this class as a service in Symfony, then add the service name
on your config file (`app/config/config.yml`) in the appropriate context(s) and
category.

The Form used to configure the element is rendered with default options. If
you want a more specific template for this form, you can add the following method
`renderConfigForm(TwigEngine $templating, Form $form)` that will be automaticaly
called if present.

### Display the dashboard

``` twig
{% stylesheets '@KalamuDashboardBundle/Resources/public/css/dashboard.css' %}
    <link href="{{ asset_url }}" type="text/css" rel="stylesheet" media="screen" />
{% endstylesheets %}

<script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
<script src="{{ asset('bundles/bazingajstranslation/js/translator.min.js') }}"></script>
<script src="{{ url('bazinga_jstranslation_js', {'domain': 'kalamu'}) }}"></script>

{% javascripts
    '@KalamuDashboardBundle/Resources/public/js/dashboard/widget.js'
    '@KalamuDashboardBundle/Resources/public/js/dashboard/col.js'
    '@KalamuDashboardBundle/Resources/public/js/dashboard/row.js'
    '@KalamuDashboardBundle/Resources/public/js/dashboard/section.js'
    '@KalamuDashboardBundle/Resources/public/js/dashboard/explorer.js'
    '@KalamuDashboardBundle/Resources/public/js/dashboard/generic-row.js'
    '@KalamuDashboardBundle/Resources/public/js/cms-dashboard.js'
%}
<script type="text/javascript" src="{{ asset_url }}"></script>
{% endjavascripts %}

<div id="MyDashboard"></div>
<button id="saveMyDashboard">Save</button>
<script type="text/javascript">
$(function(){
    Translator.locale = '{{app.request.getLocale()}}';

    // Explorer for widgets
    explorerWidget = $('<div>').appendTo('body').kalamuElementExplorer({
        element_api: '{{path('api_element_base_url')}}',
        element_context: 'cms',
        type: 'cms.content',
        modalOptions: {backdrop: 'static'}
    });

    // Dashboard for element organisation
    $('#MyDashboard').kalamuDashboard({
        explorerWidget: explorerWidget,
        enable_widget: true
    });

    $('#saveMyDashboard').click(function(e){
        e.preventDefault();
        datas = $('#MyDashboard').kalamuDashboard('export');
        // Do whatever you want to save the datas.
        // They can be reinjected after with the 'import' method.
    });
});
</script>
```
