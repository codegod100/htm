{ pkgs, ... }: {

  # Which nixpkgs channel to use.
  channel = "unstable"; # or "unstable"

  
# Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.devbox
  ];

  # Sets environment variables in the workspace
  # env = {
  #   SOME_ENV_VAR = "hello";
  # };

  # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
  idx.extensions = [
    # "angular.ng-template"
  ];

  # Enable previews and customize configuration
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [
          "bun"
          "run"
          "dev"
        ];
        manager = "web";
      };
    };
  };
}
