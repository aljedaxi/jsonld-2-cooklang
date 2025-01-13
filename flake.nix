{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, self, flake-utils, ... }: flake-utils.lib.eachDefaultSystem (system:
    let pkgs = nixpkgs.legacyPackages.${system}; in
    {
       devShells.default = pkgs.mkShell {
         packages = with pkgs; [gnumake nodejs];
         shellHook = ''exec zsh'';
       };
       packages.default = pkgs.buildNpmPackage {
         dontNpmBuild = true;
         name = "extractor";
         npmDepsHash = "sha256-CWYS+d3CXKCKcj3s7lSwrKJTuq/xGtX2MDcUMFAKXFA=";
         src = ./.;
       };
       apps.default = {
         type = "app";
         program = "${self.packages."${system}".default}/lib/node_modules/jsonld-2-cooklang/main.js";
       };
    });
}
