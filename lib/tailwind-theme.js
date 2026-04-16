// TỰ ĐỘNG MAP CSS VARIABLE CHO TAILWIND 
export const figmaTheme = {
  "color": {
    "bg": {
      "page": "var(--color-bg-page)",
      "subtle": "var(--color-bg-subtle)",
      "surface": "var(--color-bg-surface)",
      "elevated": "var(--color-bg-elevated)",
      "inverse": "var(--color-bg-inverse)",
      "overlay": "var(--color-bg-overlay)",
      "bg-decor": "var(--color-bg-bg-decor)"
    },
    "text": {
      "primary": "var(--color-text-primary)",
      "secondary": "var(--color-text-secondary)",
      "muted": "var(--color-text-muted)",
      "inverse": "var(--color-text-inverse)",
      "on-brand": "var(--color-text-on-brand)",
      "on-accent": "var(--color-text-on-accent)",
      "on-success": "var(--color-text-on-success)",
      "on-error": "var(--color-text-on-error)",
      "on-info": "var(--color-text-on-info)",
      "link": "var(--color-text-link)",
      "link-hover": "var(--color-text-link-hover)"
    },
    "icon": {
      "primary": "var(--color-icon-primary)",
      "secondary": "var(--color-icon-secondary)",
      "muted": "var(--color-icon-muted)",
      "inverse": "var(--color-icon-inverse)"
    },
    "border": {
      "subtle": "var(--color-border-subtle)",
      "default": "var(--color-border-default)",
      "strong": "var(--color-border-strong)",
      "inverse": "var(--color-border-inverse)"
    },
    "focus": {
      "ring": "var(--color-focus-ring)"
    },
    "action": {
      "brand": {
        "bg": {
          "default": "var(--color-action-brand-bg-default)",
          "hover": "var(--color-action-brand-bg-hover)",
          "pressed": "var(--color-action-brand-bg-pressed)",
          "disabled": "var(--color-action-brand-bg-disabled)"
        },
        "text": {
          "default": "var(--color-action-brand-text-default)",
          "disabled": "var(--color-action-brand-text-disabled)"
        }
      },
      "accent": {
        "bg": {
          "default": "var(--color-action-accent-bg-default)",
          "hover": "var(--color-action-accent-bg-hover)",
          "pressed": "var(--color-action-accent-bg-pressed)"
        },
        "text": {
          "default": "var(--color-action-accent-text-default)"
        }
      },
      "subtle": {
        "bg": {
          "default": "var(--color-action-subtle-bg-default)",
          "hover": "var(--color-action-subtle-bg-hover)",
          "pressed": "var(--color-action-subtle-bg-pressed)"
        },
        "text": {
          "default": "var(--color-action-subtle-text-default)"
        }
      },
      "destructive": {
        "bg": {
          "default": "var(--color-action-destructive-bg-default)",
          "hover": "var(--color-action-destructive-bg-hover)",
          "pressed": "var(--color-action-destructive-bg-pressed)"
        },
        "text": {
          "default": "var(--color-action-destructive-text-default)"
        }
      }
    },
    "field": {
      "border": {
        "default": "var(--color-field-border-default)",
        "hover": "var(--color-field-border-hover)",
        "focus": "var(--color-field-border-focus)",
        "error": "var(--color-field-border-error)",
        "disabled": "var(--color-field-border-disabled)"
      },
      "text": {
        "value": "var(--color-field-text-value)",
        "placeholder": "var(--color-field-text-placeholder)",
        "label": "var(--color-field-text-label)",
        "helper": "var(--color-field-text-helper)",
        "error": "var(--color-field-text-error)"
      },
      "bg": {
        "default": "var(--color-field-bg-default)",
        "disabled": "var(--color-field-bg-disabled)"
      }
    },
    "feedback": {
      "success": {
        "bg": "var(--color-feedback-success-bg)",
        "border": "var(--color-feedback-success-border)",
        "text": "var(--color-feedback-success-text)",
        "icon": "var(--color-feedback-success-icon)"
      },
      "warning": {
        "bg": "var(--color-feedback-warning-bg)",
        "border": "var(--color-feedback-warning-border)",
        "text": "var(--color-feedback-warning-text)",
        "icon": "var(--color-feedback-warning-icon)"
      },
      "error": {
        "bg": "var(--color-feedback-error-bg)",
        "border": "var(--color-feedback-error-border)",
        "text": "var(--color-feedback-error-text)",
        "icon": "var(--color-feedback-error-icon)"
      },
      "info": {
        "bg": "var(--color-feedback-info-bg)",
        "border": "var(--color-feedback-info-border)",
        "text": "var(--color-feedback-info-text)",
        "icon": "var(--color-feedback-info-icon)"
      }
    },
    "state": {
      "payment": {
        "pending": {
          "bg": "var(--color-state-payment-pending-bg)",
          "border": "var(--color-state-payment-pending-border)",
          "text": "var(--color-state-payment-pending-text)"
        },
        "success": {
          "bg": "var(--color-state-payment-success-bg)",
          "border": "var(--color-state-payment-success-border)",
          "text": "var(--color-state-payment-success-text)"
        },
        "failed": {
          "bg": "var(--color-state-payment-failed-bg)",
          "border": "var(--color-state-payment-failed-border)",
          "text": "var(--color-state-payment-failed-text)"
        },
        "expired": {
          "bg": "var(--color-state-payment-expired-bg)",
          "border": "var(--color-state-payment-expired-border)",
          "text": "var(--color-state-payment-expired-text)"
        },
        "cancelled": {
          "bg": "var(--color-state-payment-cancelled-bg)",
          "border": "var(--color-state-payment-cancelled-border)",
          "text": "var(--color-state-payment-cancelled-text)"
        }
      },
      "seat": {
        "available": {
          "bg": "var(--color-state-seat-available-bg)",
          "border": "var(--color-state-seat-available-border)",
          "text": "var(--color-state-seat-available-text)"
        },
        "held": {
          "bg": "var(--color-state-seat-held-bg)",
          "border": "var(--color-state-seat-held-border)",
          "text": "var(--color-state-seat-held-text)"
        },
        "selected": {
          "bg": "var(--color-state-seat-selected-bg)",
          "border": "var(--color-state-seat-selected-border)",
          "text": "var(--color-state-seat-selected-text)"
        },
        "sold": {
          "bg": "var(--color-state-seat-sold-bg)",
          "border": "var(--color-state-seat-sold-border)",
          "text": "var(--color-state-seat-sold-text)"
        },
        "blocked": {
          "bg": "var(--color-state-seat-blocked-bg)",
          "border": "var(--color-state-seat-blocked-border)",
          "text": "var(--color-state-seat-blocked-text)"
        }
      },
      "ticket": {
        "valid": {
          "bg": "var(--color-state-ticket-valid-bg)",
          "text": "var(--color-state-ticket-valid-text)"
        },
        "used": {
          "bg": "var(--color-state-ticket-used-bg)",
          "text": "var(--color-state-ticket-used-text)"
        },
        "on-sale": {
          "bg": "var(--color-state-ticket-on-sale-bg)",
          "text": "var(--color-state-ticket-on-sale-text)"
        },
        "locked": {
          "bg": "var(--color-state-ticket-locked-bg)",
          "text": "var(--color-state-ticket-locked-text)"
        },
        "pending": {
          "bg": "var(--color-state-ticket-pending-bg)",
          "text": "var(--color-state-ticket-pending-text)"
        },
        "failed": {
          "bg": "var(--color-state-ticket-failed-bg)",
          "text": "var(--color-state-ticket-failed-text)"
        }
      }
    }
  },
  "button": {
    "radius": "var(--button-radius)",
    "border-width": "var(--button-border-width)",
    "height": {
      "sm": "var(--button-height-sm)",
      "md": "var(--button-height-md)",
      "lg": "var(--button-height-lg)"
    },
    "padding": {
      "x": {
        "sm": "var(--button-padding-x-sm)",
        "md": "var(--button-padding-x-md)",
        "lg": "var(--button-padding-x-lg)"
      },
      "y": {
        "sm": "var(--button-padding-y-sm)",
        "md": "var(--button-padding-y-md)",
        "lg": "var(--button-padding-y-lg)"
      }
    },
    "primary": {
      "bg": {
        "default": "var(--button-primary-bg-default)",
        "hover": "var(--button-primary-bg-hover)",
        "pressed": "var(--button-primary-bg-pressed)",
        "disabled": "var(--button-primary-bg-disabled)"
      },
      "text": {
        "default": "var(--button-primary-text-default)",
        "disabled": "var(--button-primary-text-disabled)"
      },
      "border": {
        "default": "var(--button-primary-border-default)"
      }
    },
    "secondary": {
      "bg": {
        "default": "var(--button-secondary-bg-default)",
        "hover": "var(--button-secondary-bg-hover)",
        "pressed": "var(--button-secondary-bg-pressed)"
      },
      "text": {
        "default": "var(--button-secondary-text-default)"
      },
      "border": {
        "default": "var(--button-secondary-border-default)"
      }
    },
    "ghost": {
      "bg": {
        "default": "var(--button-ghost-bg-default)",
        "hover": "var(--button-ghost-bg-hover)",
        "pressed": "var(--button-ghost-bg-pressed)"
      },
      "text": {
        "default": "var(--button-ghost-text-default)"
      },
      "border": {
        "default": "var(--button-ghost-border-default)"
      }
    },
    "accent": {
      "bg": {
        "default": "var(--button-accent-bg-default)",
        "hover": "var(--button-accent-bg-hover)",
        "pressed": "var(--button-accent-bg-pressed)"
      },
      "text": {
        "default": "var(--button-accent-text-default)"
      },
      "border": {
        "default": "var(--button-accent-border-default)"
      }
    },
    "destructive": {
      "bg": {
        "default": "var(--button-destructive-bg-default)",
        "hover": "var(--button-destructive-bg-hover)",
        "pressed": "var(--button-destructive-bg-pressed)"
      },
      "text": {
        "default": "var(--button-destructive-text-default)"
      },
      "border": {
        "default": "var(--button-destructive-border-default)"
      }
    }
  },
  "field": {
    "radius": "var(--field-radius)",
    "border-width": "var(--field-border-width)",
    "height": {
      "md": "var(--field-height-md)"
    },
    "min-height": {
      "textarea": {
        "md": "var(--field-min-height-textarea-md)"
      }
    },
    "padding": {
      "x": "var(--field-padding-x)",
      "y": "var(--field-padding-y)"
    }
  },
  "input": {
    "focus-ring": "var(--input-focus-ring)",
    "bg": {
      "default": "var(--input-bg-default)",
      "disabled": "var(--input-bg-disabled)"
    },
    "border": {
      "default": "var(--input-border-default)",
      "hover": "var(--input-border-hover)",
      "focus": "var(--input-border-focus)",
      "error": "var(--input-border-error)",
      "disabled": "var(--input-border-disabled)"
    },
    "text": {
      "value": "var(--input-text-value)",
      "placeholder": "var(--input-text-placeholder)",
      "label": "var(--input-text-label)",
      "helper": "var(--input-text-helper)",
      "error": "var(--input-text-error)"
    }
  },
  "card": {
    "radius": "var(--card-radius)",
    "padding": "var(--card-padding)",
    "bg": {
      "default": "var(--card-bg-default)",
      "elevated": "var(--card-bg-elevated)"
    },
    "border": {
      "default": "var(--card-border-default)"
    }
  },
  "modal": {
    "bg": "var(--modal-bg)",
    "border": "var(--modal-border)",
    "backdrop": "var(--modal-backdrop)",
    "Number": "var(--modal-Number)",
    "padding": "var(--modal-padding)"
  },
  "drawer": {
    "bg": "var(--drawer-bg)",
    "border": "var(--drawer-border)",
    "backdrop": "var(--drawer-backdrop)"
  },
  "alert": {
    "success": {
      "bg": "var(--alert-success-bg)",
      "border": "var(--alert-success-border)",
      "text": "var(--alert-success-text)",
      "icon": "var(--alert-success-icon)"
    },
    "warning": {
      "bg": "var(--alert-warning-bg)",
      "border": "var(--alert-warning-border)",
      "text": "var(--alert-warning-text)",
      "icon": "var(--alert-warning-icon)"
    },
    "error": {
      "bg": "var(--alert-error-bg)",
      "border": "var(--alert-error-border)",
      "text": "var(--alert-error-text)",
      "icon": "var(--alert-error-icon)"
    },
    "info": {
      "bg": "var(--alert-info-bg)",
      "border": "var(--alert-info-border)",
      "text": "var(--alert-info-text)",
      "icon": "var(--alert-info-icon)"
    }
  },
  "badge": {
    "radius": "var(--badge-radius)",
    "padding": {
      "x": "var(--badge-padding-x)",
      "y": "var(--badge-padding-y)"
    }
  },
  "tab": {
    "height": "var(--tab-height)",
    "radius": "var(--tab-radius)",
    "text": {
      "default": "var(--tab-text-default)",
      "active": "var(--tab-text-active)"
    },
    "bg": {
      "default": "var(--tab-bg-default)",
      "hover": "var(--tab-bg-hover)",
      "active": "var(--tab-bg-active)"
    },
    "border": {
      "default": "var(--tab-border-default)"
    }
  },
  "chip": {
    "filter": {
      "radius": "var(--chip-filter-radius)",
      "bg": {
        "default": "var(--chip-filter-bg-default)",
        "hover": "var(--chip-filter-bg-hover)",
        "selected": "var(--chip-filter-bg-selected)"
      },
      "text": {
        "default": "var(--chip-filter-text-default)",
        "selected": "var(--chip-filter-text-selected)"
      },
      "border": {
        "default": "var(--chip-filter-border-default)",
        "selected": "var(--chip-filter-border-selected)"
      }
    }
  },
  "navbar": {
    "topbar": {
      "bg": "var(--navbar-topbar-bg)",
      "border": "var(--navbar-topbar-border)",
      "text": {
        "default": "var(--navbar-topbar-text-default)",
        "active": "var(--navbar-topbar-text-active)"
      },
      "icon": {
        "default": "var(--navbar-topbar-icon-default)",
        "active": "var(--navbar-topbar-icon-active)"
      }
    }
  },
  "seat": {
    "size": "var(--seat-size)",
    "radius": "var(--seat-radius)",
    "border-width": "var(--seat-border-width)",
    "bg": {
      "available": "var(--seat-bg-available)",
      "held": "var(--seat-bg-held)",
      "selected": "var(--seat-bg-selected)",
      "sold": "var(--seat-bg-sold)",
      "blocked": "var(--seat-bg-blocked)"
    },
    "border": {
      "available": "var(--seat-border-available)",
      "held": "var(--seat-border-held)",
      "selected": "var(--seat-border-selected)",
      "sold": "var(--seat-border-sold)",
      "blocked": "var(--seat-border-blocked)"
    },
    "text": {
      "available": "var(--seat-text-available)",
      "held": "var(--seat-text-held)",
      "selected": "var(--seat-text-selected)",
      "sold": "var(--seat-text-sold)",
      "blocked": "var(--seat-text-blocked)"
    }
  },
  "status-pill": {
    "radius": "var(--status-pill-radius)",
    "padding": {
      "x": "var(--status-pill-padding-x)",
      "y": "var(--status-pill-padding-y)"
    },
    "payment": {
      "pending": {
        "bg": "var(--status-pill-payment-pending-bg)",
        "border": "var(--status-pill-payment-pending-border)",
        "text": "var(--status-pill-payment-pending-text)"
      },
      "success": {
        "bg": "var(--status-pill-payment-success-bg)",
        "border": "var(--status-pill-payment-success-border)",
        "text": "var(--status-pill-payment-success-text)"
      },
      "failed": {
        "bg": "var(--status-pill-payment-failed-bg)",
        "border": "var(--status-pill-payment-failed-border)",
        "text": "var(--status-pill-payment-failed-text)"
      },
      "expired": {
        "bg": "var(--status-pill-payment-expired-bg)",
        "border": "var(--status-pill-payment-expired-border)",
        "text": "var(--status-pill-payment-expired-text)"
      },
      "cancelled": {
        "bg": "var(--status-pill-payment-cancelled-bg)",
        "border": "var(--status-pill-payment-cancelled-border)",
        "text": "var(--status-pill-payment-cancelled-text)"
      }
    }
  }
};
