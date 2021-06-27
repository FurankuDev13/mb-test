<?php

namespace App\Traits;

use Doctrine\ORM\Mapping as ORM;

trait Tanukiable
{
  /**
   * @ORM\Column(type="boolean", nullable=true)
   */
  private $isActive = 1;

  public function getIsActive(): ?bool
  {
    return $this->isActive;
  }

  public function setIsActive(?bool $isActive): self
  {
    $this->isActive = $isActive;

    return $this;
  }
}
