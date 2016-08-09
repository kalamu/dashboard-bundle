<?php

namespace Kalamu\DashboardBundle;

/**
 * Interface for Elements persistence
 */
interface ElementPersistenceInterface
{
    
    /**
     * Get the list of all elements identifiers
     */
    public function getList();
    

    /**
     * Get parameters of the element in JSON format
     * @param string $identifier
     * @return string
     */
    public function getElement($identifier);
    
    /**
     * Set an element
     * @param string $identifier
     * @param string $parameters parameters of the element in JSON format
     */
    public function setElement($identifier, $parameters);

    /**
     * Delete an element
     * @param string $identifier
     */
    public function removeElement($identifier);
    
    
}