workflow "Trigger Docker Hub build" {
  on = "tag"
  resolves = ["Call Docker Hub"]
}

action "Call Docker Hub" {
  uses = "swinton/httpie.action@master"
  args = ["POST", "https://hub.docker.com/api/build/v1/source/83564f19-c21a-4dae-9690-971aee3b2a3b/trigger/6a6767a6-7d0d-4050-9055-958552e53b98/call/", ""]
}
