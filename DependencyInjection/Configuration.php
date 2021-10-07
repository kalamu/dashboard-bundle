<?php

namespace Kalamu\DashboardBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

/**
 * This is the class that validates and merges configuration from your app/config files
 *
 * To learn more see {@link http://symfony.com/doc/current/cookbook/bundles/extension.html#cookbook-bundles-extension-config-class}
 */
class Configuration implements ConfigurationInterface
{
    /**
     * {@inheritdoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder('kalamu_dashboard');

        $treeBuilder->getRootNode()
                ->children()
                    ->arrayNode('contexts')
                        ->fixXmlConfig('name')
                        ->prototype('array')
                            ->children()
                                ->arrayNode('types')
                                    ->prototype('array')
                                        ->prototype('array') //categories
                                            ->prototype('scalar')->end() // elements
                                        ->end()
                                    ->end()
                                ->end()
                            ->end()
                        ->end()
                    ->end()
                ->end();

        return $treeBuilder;
    }
}
