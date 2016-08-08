<?php

namespace Kalamu\DashboardBundle\Manager;

use Roho\DashboardBundle\Model\AbstractWidgetProvider;
use Roho\DashboardBundle\Model\AbstractWidget;
use Roho\DashboardBundle\Manager\WidgetTypeManager;
use Roho\DashboardBundle\Exception\WidgetManagerException;
use Roho\DashboardBundle\Entity\WidgetContext;
use Roho\DashboardBundle\Entity\WidgetType;
use Roho\DashboardBundle\Entity\WidgetService;

/**
 * Element Manager
 */
class ElementManager
{
    
    /**
     * Service Container
     * @var type 
     */
    protected $container;

    /**
     * List of elements by tag
     * @var array 
     */
    protected $elements;
    
    public function __construct($container) {
        $this->container = $container;
        $this->elements = [];
    }
    
    /**
     * Register a new type of element with the associated contexts
     * @param string $type Type name
     * @param array $contexts List of contexts for this type
     */
    protected function addElementType($type, $contexts){
        $this->elements[$type] = array();
        foreach($contexts as $context){
            $this->elements[$type][$context] = array();
        }
    }
    
    /**
     * Register a new element
     * @param string $type
     * @param string $context
     * @param string $service_name
     */
    protected function addElement($type, $context, $service_name, $categorie = 'default'){
        $this->elements[$type][$context][$service_name] = $categorie;
    }
    
    /**
     * Get the list of elements of the given type in context
     * @return array
     */
    public function getElements($type, $context){
        return array_keys($this->elements[$type][$context]);
    }

    /**
     * Get the list of categories for the given type and context
     * @return array
     */
    public function getCategories($type, $context){
        return array_unique(array_values($this->elements[$type][$context]));
    }


    /**
     * Get the list of elements in the given categorie
     * @param array
     */
    public function getElementsInCategorie($type, $context, $categorie){
        $services = array_filter($this->elements[$type][$context], function($key, $value) use ($categorie){
            return $value == $categorie;
        }, ARRAY_FILTER_USE_BOTH);

        return array_keys($services);
    }

    /**
     * Get the service responsible for the element
     * @param string $element
     */
    public function getElement($element){
        return $this->container->get($element);
    }

}