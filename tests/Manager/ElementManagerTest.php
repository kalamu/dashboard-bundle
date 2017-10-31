<?php

namespace Kalamu\DashboardBundle\Tests\Manager;

use Kalamu\DashboardBundle\Exception\ElementManagerException;
use Kalamu\DashboardBundle\Manager\ElementManager;
use PHPUnit\Framework\TestCase;
use Symfony\Component\DependencyInjection\Container;

class ElementManagerTest extends TestCase{

    public function testGetCategories(){

        $container = $this->createMock(Container::class);
        $manager = new ElementManager($container, [
            'context-a' => ['types' => ['type1' => ['cat1' => [], 'cat2' => []]]],
            'context-b' => ['types' => ['type2' => ['cat1' => []]]],
        ]);
        $this->assertEquals(['cat1', 'cat2'], $manager->getCategories('context-a', 'type1'));
        $this->assertEquals(['cat1'], $manager->getCategories('context-b', 'type2'));

        $this->expectException(ElementManagerException::class);
        $manager->getCategories('foo', 'bar');
        $this->expectException(ElementManagerException::class);
        $manager->getCategories('context-a', 'typex');
    }

    public function testGetElementsInCategory(){

        $container = $this->createMock(Container::class);
        $manager = new ElementManager($container, [
            'context-a' => ['types' => ['type1' => ['cat1' => ['foo', 'bar'], 'cat2' => ['bar']]]],
        ]);
        $this->assertEquals(['foo', 'bar'], $manager->getElementsInCategory('context-a', 'type1', 'cat1'));
        $this->assertEquals(['bar'], $manager->getElementsInCategory('context-a', 'type1', 'cat2'));

        $this->expectException(ElementManagerException::class);
        $manager->getElementsInCategory('context-a', 'type1', 'invalid');
        $this->expectException(ElementManagerException::class);
        $manager->getElementsInCategory('context-a', 'invalid', 'invalid');
        $this->expectException(ElementManagerException::class);
        $manager->getElementsInCategory('invalid', 'invalid', 'invalid');

    }

    public function testGetElement(){

        $container = $this->getMockBuilder(Container::class)
                ->setMethods(['get'])
                ->getMock();

        $container->expects($this->exactly(2))
                ->method('get')
                ->withConsecutive($this->equalTo('element-a'), $this->equalTo('element-b'))
                ->willReturnOnConsecutiveCalls('A', 'B');

        $manager = new ElementManager($container, [
            'context-a' => ['types' => ['type1' => ['cat1' => ['element-a', 'element-b'], 'cat2' => ['element-b']]]],
        ]);
        $this->assertEquals('A', $manager->getElement('context-a', 'type1', 'element-a'));
        $this->assertEquals('B', $manager->getElement('context-a', 'type1', 'element-b'));
    }

}
