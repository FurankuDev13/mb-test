<?php

namespace App\Entity;

use App\Repository\VesselRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="mb_vessel")
 * @ORM\Entity(repositoryClass=VesselRepository::class)
 */
class Vessel
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity=VesselType::class, inversedBy="vessels")
     */
    private $vesselType;

    /**
     * @ORM\Column(type="string", length=10)
     */
    private $code;

    use \App\Traits\Tanukiable;
    use \App\Traits\Timestampable;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getVesselType(): ?VesselType
    {
        return $this->vesselType;
    }

    public function setVesselType(?VesselType $vesselType): self
    {
        $this->vesselType = $vesselType;

        return $this;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): self
    {
        $this->code = $code;

        return $this;
    }
}
