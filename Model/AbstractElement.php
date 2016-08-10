<?php

namespace Kalamu\DashboardBundle\Model;

use Symfony\Bundle\TwigBundle\TwigEngine;

/**
 * Abstract class for Elements
 */
abstract class AbstractElement
{

    /**
     * Element parameters
     * @var array
     */
    protected $paramaters;

    /**
     * Return the name of the element
     * @return string
     */
    abstract public function getTitle();

    /**
     * Return the description of the element and his usage
     * @return string
     */
    abstract public function getDescription();

    /**
     * Render the element
     * @return string
     */
    abstract public function render(TwigEngine $templating);

    /**
     * Set parameters
     * @param array $parameters
     */
    public function setParameters($parameters){
        $this->paramaters = $parameters;
    }

}