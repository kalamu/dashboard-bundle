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
     * Full list of elements and config
     * @var array 
     */
    protected $elements;
    
    public function __construct($container, array $config) {
        $this->container = $container;
        $this->elements = $config;
    }
    
    /**
     * Register a new element type
     * @param string $context 
     * @param string $type 
     * @param string $persistence service name for persistence layer
     */
    protected function addElementType($context, $type, $persistence){
        if(!isset($this->elements[$context])){
            $this->elements[$context] = ['types' => []];
        }
        $this->elements[$context]['persistence'] = $persistence;
        
        if(!isset($this->elements[$context]['types'][$type])){
            $this->elements[$context]['types'][$type] = [];
        }
    }
    
    /**
     * Register a new element
     * @param string $context
     * @param string $type
     * @param string $service_name
     * @param string $categorie
     */
    protected function addElement($context, $type, $service_name, $categorie = 'default'){
        if(!isset($this->elements[$context]['types'][$type])){
            $this->elements[$context]['types'][$type][$categorie] = [];
        }
        
        $this->elements[$context]['types'][$type][$categorie] = $service_name;
    }
    
    /**
     * Get the persistence service for the context
     * @return \Kalamu\DashboardBundle\ElementPersistenceInterface
     */
    public function getPersistence($context){
        return $this->container->get($this->elements[$context]['persistence']);
    }

    /**
     * Get the list of categories for the given type
     * @return array
     */
    public function getCategories($context, $type){
        return array_keys($this->elements[$context]['types'][$type]);
    }


    /**
     * Get the list of elements in the given categorie
     * @param array
     */
    public function getElementsInCategorie($context, $type, $categorie){
        return $this->elements[$context]['types'][$type][$categorie];
    }

    /**
     * Get the service responsible for the element
     * @param string $element
     */
    public function getElement($element){
        return $this->container->get($element);
    }

}