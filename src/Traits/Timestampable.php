<?php

namespace App\Traits;

use Gedmo\Mapping\Annotation as Gedmo;
use JMS\Serializer\Annotation as Serializer;
/* @Gedmo\Timestampable(on="create") */

trait Timestampable
{

  /**
   * @ORM\Column(type="datetime",nullable=true)
   * @Gedmo\Timestampable(on="create")
   *
   */
  protected $createdAt;

  /**
   * @ORM\Column(type="datetime",nullable=true)
   * @Gedmo\Timestampable(on="update")
   *
   */
  protected $updatedAt;

  /**
   * @param \DateTime $createdAt
   * @return mixed
   */
  public function setCreatedAt(\DateTime $createdAt)
  {
    $this->createdAt = $createdAt;

    return $this;
  }

  /**
   * @return mixed
   */
  public function getCreatedAt()
  {
    return $this->createdAt;
  }

  /**
   * @param \DateTime $updatedAt
   * @return mixed
   */
  public function setUpdatedAt(\DateTime $updatedAt)
  {
    $this->updatedAt = $updatedAt;

    return $this;
  }

  /**
   * @return mixed
   */
  public function getUpdatedAt()
  {
    return $this->updatedAt;
  }

}
