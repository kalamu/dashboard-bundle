<?php

namespace Kalamu\DashboardBundle\Model;

use Twig\Environment;

/**
 * Abstract class for Elements
 */
abstract class AbstractElement
{

    /**
     * Element parameters
     * @var array
     */
    protected $parameters;

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
    abstract public function render(Environment $templating);

    /**
     * Set parameters
     * @param array $parameters
     */
    public function setParameters($parameters)
    {
        $this->parameters = $parameters;
    }

    /**
     * This method state that this element does not write in session.
     * When this method return "true", the controller release the session.
     * This allow concurrent requests witch improve the performances.
     *
     * Do not release session if you write on it like when you use forms, flashBag messages, ...
     *
     * @return boolean
     */
    public function canReleaseSession()
    {
        return false;
    }
}
