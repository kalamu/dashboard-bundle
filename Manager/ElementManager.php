<?php

namespace Kalamu\DashboardBundle\Manager;

use Kalamu\DashboardBundle\Exception\ElementManagerException;

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
        
        return $this->container->get($this->getContext($context)['persistence']);
    }

    /**
     * Get the list of categories for the given type
     * @return array
     */
    public function getCategories($context, $type){
        return array_keys($this->getContextType($context, $type));
    }


    /**
     * Get the list of elements in the given categorie
     * @param array
     */
    public function getElementsInCategorie($context, $type, $categorie){
        $infos = $this->getContextType($context, $type);
        if(!isset($infos[$categorie])){
            throw new ElementManagerException(sprintf("Unknown categorie '%s'", $categorie));
        }
        
        return $infos[$categorie];
    }

    /**
     * Get the service responsible for the element
     * @param string $element
     */
    public function getElement($element){
        return $this->container->get($element);
    }

    /**
     * Get infos of the type in context
     * @param string $context
     * @param string $type
     * @return array
     * @throws ElementManagerException
     */
    protected function getContextType($context, $type){
        $infos = $this->getContext($context);
        if(!isset($infos['types'][$type])){
            throw new ElementManagerException(sprintf("The type '%s' is undefined in context '%s'", $type, $context));
        }
        
        return $infos['types'][$type];
    }
    
    /**
     * Get the context infos
     * @param string $context
     * @return array
     * @throws ElementManagerException
     */
    protected function getContext($context){
        if(!isset($this->elements[$context])){
            throw new ElementManagerException(sprintf("The context '%s' is undefined", $context));
        }
        
        return $this->elements[$context];
    }
}