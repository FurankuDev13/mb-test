<?php

namespace App\Entity;

use App\Repository\VesselTypeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="mb_vessel_type")
 * @ORM\Entity(repositoryClass=VesselTypeRepository::class)
 */
class VesselType
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity=VesselType::class, inversedBy="vesselTypes")
     */
    private $parent;

    /**
     * @ORM\OneToMany(targetEntity=VesselType::class, mappedBy="parent")
     */
    private $vesselTypes;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $label;

    /**
     * @ORM\Column(type="string", length=10, nullable=true)
     */
    private $code;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $medicalUnitCount;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $canonCount;

    /**
     * @ORM\ManyToMany(targetEntity=Command::class, inversedBy="vesselTypes")
     */
    private $commands;

    /**
     * @ORM\OneToMany(targetEntity=Vessel::class, mappedBy="vesselType")
     */
    private $vessels;

    use \App\Traits\Tanukiable;
    use \App\Traits\Timestampable;

    public function __construct()
    {
        $this->vesselTypes = new ArrayCollection();
        $this->commands = new ArrayCollection();
        $this->vessels = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getParent(): ?self
    {
        return $this->parent;
    }

    public function setParent(?self $parent): self
    {
        $this->parent = $parent;

        return $this;
    }

    /**
     * @return Collection|self[]
     */
    public function getVesselTypes(): Collection
    {
        return $this->vesselTypes;
    }

    public function addVesselType(self $vesselType): self
    {
        if (!$this->vesselTypes->contains($vesselType)) {
            $this->vesselTypes[] = $vesselType;
            $vesselType->setParent($this);
        }

        return $this;
    }

    public function removeVesselType(self $vesselType): self
    {
        if ($this->vesselTypes->removeElement($vesselType)) {
            // set the owning side to null (unless already changed)
            if ($vesselType->getParent() === $this) {
                $vesselType->setParent(null);
            }
        }

        return $this;
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

    public function getMedicalUnitCount(): ?int
    {
        return $this->medicalUnitCount;
    }

    public function setMedicalUnitCount(?int $medicalUnitCount): self
    {
        $this->medicalUnitCount = $medicalUnitCount;

        return $this;
    }

    public function getCanonCount(): ?int
    {
        return $this->canonCount;
    }

    public function setCanonCount(?int $canonCount): self
    {
        $this->canonCount = $canonCount;

        return $this;
    }

    /**
     * @return Collection|Command[]
     */
    public function getCommands(): Collection
    {
        return $this->commands;
    }

    public function addCommand(Command $command): self
    {
        if (!$this->commands->contains($command)) {
            $this->commands[] = $command;
        }

        return $this;
    }

    public function removeCommand(Command $command): self
    {
        $this->commands->removeElement($command);

        return $this;
    }

    /**
     * @return Collection|Vessel[]
     */
    public function getVessels(): Collection
    {
        return $this->vessels;
    }

    public function addVessel(Vessel $vessel): self
    {
        if (!$this->vessels->contains($vessel)) {
            $this->vessels[] = $vessel;
            $vessel->setVesselType($this);
        }

        return $this;
    }

    public function removeVessel(Vessel $vessel): self
    {
        if ($this->vessels->removeElement($vessel)) {
            // set the owning side to null (unless already changed)
            if ($vessel->getVesselType() === $this) {
                $vessel->setVesselType(null);
            }
        }

        return $this;
    }
}
