<?php

namespace Kalamu\DashboardBundle\Model;

use Kalamu\DashboardBundle\Model\AbstractElement;
use Symfony\Component\Form\Form;

/**
 * Abstract class for configurable element
 */
abstract class AbstractConfigurableElement extends AbstractElement
{

    /**
     * Get the config form
     * @return mixed string or \Symfony\Component\Form\Form
     */
    abstract public function getForm(Form $form);

}