<?php

namespace App\Entity;

use App\Repository\CommandRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="mb_command")
 * @ORM\Entity(repositoryClass=CommandRepository::class)
 */
class Command
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $label;

    /**
     * @ORM\Column(type="string", length=10, nullable=true)
     */
    private $code;

    /**
     * @ORM\ManyToMany(targetEntity=VesselType::class, mappedBy="commands")
     */
    private $vesselTypes;

    use \App\Traits\Tanukiable;
    use \App\Traits\Timestampable;

    public function __construct()
    {
        $this->vesselTypes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(?string $label): self
    {
        $this->label = $label;

        return $this;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(?string $code): self
    {
        $this->code = $code;

        return $this;
    }

    /**
     * @return Collection|VesselType[]
     */
    public function getVesselTypes(): Collection
    {
        return $this->vesselTypes;
    }

    public function addVesselType(VesselType $vesselType): self
    {
        if (!$this->vesselTypes->contains($vesselType)) {
            $this->vesselTypes[] = $vesselType;
            $vesselType->addCommand($this);
        }

        return $this;
    }

    public function removeVesselType(VesselType $vesselType): self
    {
        if ($this->vesselTypes->removeElement($vesselType)) {
            $vesselType->removeCommand($this);
        }

        return $this;
    }
}
