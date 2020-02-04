<?php

namespace Kalamu\DashboardBundle\Controller;

use Kalamu\DashboardBundle\Manager\ElementManager;
use Kalamu\DashboardBundle\Model\AbstractConfigurableElement;
use Kalamu\DashboardBundle\Model\AbstractElement;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Twig\Environment;


/**
 * Controller for the Element API
 */
class ElementApiController extends Controller
{

    protected $templating;

    public function __construct(Environment $templating)
    {
        $this->templating = $templating;
    }

    /**
     * Get the categories
     *
     * @param string $context
     * @param string $type
     */
    public function categoriesAction($context, $type)
    {
        $manager = $this->getElementManager();

        $categories = array();
        foreach ($manager->getCategories($context, $type) as $category) {
            $categories[$category] = [];
            foreach ($manager->getElementsInCategory($context, $type, $category) as $element) {
                $elementService = $manager->getElement($context, $type, $element);
                $categories[$category][$element] = $elementService->getTitle();
            }
        }

        $datas = $this->renderView(
            '@KalamuDashboard/Element/categories.json.twig',
            ['categories' => $categories]
        );

        return $this->createJsonResponse($datas);
    }


    /**
     * Get infos of an element
     *
     * @param string $context
     * @param string $type
     * @param string $name
     */
    public function infoAction(Request $Request, $context, $type, $name)
    {
        $element = $this->getElementManager()->getElement($context, $type, $name);

        $infos = array(
            'identifier'    => $name,
            'title'         => $this->get('translator')->trans($element->getTitle(), array(), 'kalamu'),
            'description'   => $this->get('translator')->trans($element->getDescription(), array(), 'kalamu'),
            'context'       => $context,
            'type'          => $type
        );

        $form = $this->getConfigForm($element, 'create');
        if ($Request->isMethod('POST')) {
            $form->handleRequest($Request);
            $infos['form_valid'] = $form->isEmpty() ? true : $form->isValid();
        }

        if (method_exists($element, 'renderConfigForm')) {
            $infos['form'] = $element->renderConfigForm($this->getTemplating(), $form);
        } else {
            $infos['form'] = $this->renderView('@KalamuDashboard/Element/form.html.twig', array('form' => $form->createView(), 'element' => $element));
        }

        return $this->createJsonResponse(json_encode($infos));
    }

    /**
     * Render an element
     *
     * @param string $type
     * @param string $name
     */
    public function renderAction(Request $Request, $context, $type, $name, $format = 'json')
    {
        $element = $this->getElementManager()->getElement($context, $type, $name);

        if ($element->canReleaseSession() && $format !== 'json') {
            // Release the session because whe don't write in it
            $Request->getSession()->save();
        }

        $params = array();
        if ($element instanceof AbstractConfigurableElement) {
            $form = $this->getConfigForm($element, 'show');

            $datas = $this->extractFormDatas($Request, $form->getName());
            $form->submit($datas);
            if ($form->isValid()) {
                $params = $form->getData();
            } else {
                return $this->createJsonResponse(json_encode(array('error' => $this->get('translator')->trans('element.parameters.invalid.error', array(), 'kalamu'))));
            }
        }

        if ($Request->attributes->has('additional')) {
            $params = array_merge($Request->attributes->get('additional'), $params);
        }
        $element->setParameters($params);

        $view = $element->render($this->getTemplating(), ('json' == $format) ? 'edit' : 'publish');

        if ('json' == $format) {
            return $this->createJsonResponse(json_encode(array('content' => $view)));
        } else {
            return new Response($view);
        }
    }

    /**
     * Extract form data even if the controller is called from a template
     *
     * @param Request $Request
     * @param string $form_name
     * @return array
     */
    protected function extractFormDatas(Request $Request, $form_name)
    {
        if ($Request->query->has($form_name)) {
            return $Request->query->get($form_name);
        }
        if (!$Request->attributes->has($form_name)) {
            return array();
        }

        $url_attrs = array();
        foreach ($Request->attributes->get($form_name) as $attr) {
            $url_attrs[] = $attr['name'] . '=' . urlencode($attr['value']);
        }
        parse_str(implode('&', $url_attrs), $output);
        return $output[$form_name];
    }

    /**
     * Get the config form of an element
     *
     * @param AbstractElement $element
     * @param string $intention
     * @return Form
     */
    protected function getConfigForm(AbstractElement $element, $intention)
    {

        if ($element instanceof AbstractConfigurableElement) {

            $baseForm = $this->createForm(FormType::class, null, array('csrf_protection' => false));
            $form = $element->getForm($baseForm) ?: $baseForm;
            if (is_string($form)) {
                $form = $this->createForm($form, null, array('csrf_protection' => false));
            }
            if (!$form instanceof Form) {
                throw new \Exception(sprintf("Method getForm of element '%s' must return a Form instance: %s given", $element->getTitle(), is_object($form) ? get_class($form) : gettype($form)));
            }
        } else {
            $form = $this->createForm(FormType::class, null, array('csrf_protection' => false));
        }

        return $form;
    }

    /**
     * Get the elements manager
     * @return ElementManager
     */
    protected function getElementManager()
    {
        return $this->get('kalamu_dashboard.element_manager');
    }

    protected function createJsonResponse($datas)
    {
        $response = new Response($datas);
        $response->headers->set('Content-type', 'application/json');
        return $response;
    }

    protected function getTemplating()
    {
        return $this->templating;
    }
}
