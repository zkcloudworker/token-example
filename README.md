# zkCloudWorker TokenWorker code example

## Run tests on Devnet

```sh
yarn devnet.run
```

## Log

```
 token-example % yarn devnet.run
[2:33:34 PM] RSS memory initializing blockchain: 330 MB
[2:33:34 PM] non-local chain: devnet
[2:33:34 PM] contract address: B62qp7MvZUZ31NuysZYm5oqieCqyBdMxfc3HWZ21iKakXwWaepZSgox
[2:33:34 PM] sender: B62qpC77Fr5rDqsGrGwDJdgPcQtqCE4euHddDNPoT8vBVmbXCRKDFST
[2:33:34 PM] Sender balance: 295.4
[2:33:34 PM] RSS memory blockchain initialized: 348 MB, changed by 18 MB
[2:33:36 PM] answer: {
  success: true,
  jobId: 'zkCWF30ZxQG2hUSgbLRSzZLwrgdlOPKZkjuSX3QAHTBFrpzK',
  result: undefined,
  error: undefined
}
[2:33:46 PM] 2024-08-08T11:33:37.242Z	INFO	worker {
  command: 'execute',
  id: 'B62qo69VLUPMXEC6AFWRgjdTEGsA3xKvqeU5CgYm3jAbBJL7dTvaQkv',
  jobId: 'zkCWF30ZxQG2hUSgbLRSzZLwrgdlOPKZkjuSX3QAHTBFrpzK',
  developer: 'DFST',
  repo: 'token-example',
  args: '{"contractAddress":"B62qp7MvZUZ31NuysZYm5oqieCqyBdMxfc3HWZ21iKakXwWaepZSgox","from":"EKEbxwuDexgEy1NzyvJpt4Hgfr59RWD3QRVsu15bx3Mk8yBujnnM","to":"B62qkKg8baGtGKkn6DPrTsbnv2iFhdpdfXYro22EnHQ7s7rBdPXVW4L","amount":1000000}',
  chain: 'devnet'
}

[2:33:46 PM] 2024-08-08T11:33:37.671Z	INFO	zkCloudWorker Execute start: {
  command: 'execute',
  developer: 'DFST',
  repo: 'token-example',
  id: 'B62qo69VLUPMXEC6AFWRgjdTEGsA3xKvqeU5CgYm3jAbBJL7dTvaQkv',
  jobId: 'zkCWF30ZxQG2hUSgbLRSzZLwrgdlOPKZkjuSX3QAHTBFrpzK',
  job: {
    repo: 'token-example',
    metadata: 'send tokens',
    logStreams: [],
    task: 'send',
    developer: 'DFST',
    args: '{"contractAddress":"B62qp7MvZUZ31NuysZYm5oqieCqyBdMxfc3HWZ21iKakXwWaepZSgox","from":"EKEbxwuDexgEy1NzyvJpt4Hgfr59RWD3QRVsu15bx3Mk8yBujnnM","to":"B62qkKg8baGtGKkn6DPrTsbnv2iFhdpdfXYro22EnHQ7s7rBdPXVW4L","amount":1000000}',
    chain: 'devnet',
    txNumber: 1,
    jobStatus: 'created',
    timeCreated: 1723116815119,
    jobId: 'zkCWF30ZxQG2hUSgbLRSzZLwrgdlOPKZkjuSX3QAHTBFrpzK',
    id: 'B62qo69VLUPMXEC6AFWRgjdTEGsA3xKvqeU5CgYm3jAbBJL7dTvaQkv'
  }
}

[2:33:46 PM] 2024-08-08T11:33:37.672Z	INFO	RSS memory start: 98 MB

[2:33:46 PM] 2024-08-08T11:33:37.695Z	INFO	Running worker { developer: 'DFST', repo: 'token-example', version: '0.1.1' }

[2:33:57 PM] 2024-08-08T11:33:39.780Z	INFO	starting worker example version 0.1.1 on chain devnet

[2:33:57 PM] 2024-08-08T11:33:41.283Z	INFO	Sender B62qpC77Fr5rDqsGrGwDJdgPcQtqCE4euHddDNPoT8vBVmbXCRKDFST

[2:33:57 PM] 2024-08-08T11:33:41.285Z	INFO	Receiver B62qkKg8baGtGKkn6DPrTsbnv2iFhdpdfXYro22EnHQ7s7rBdPXVW4L

[2:33:57 PM] 2024-08-08T11:33:41.286Z	INFO	Contract B62qp7MvZUZ31NuysZYm5oqieCqyBdMxfc3HWZ21iKakXwWaepZSgox

[2:33:57 PM] 2024-08-08T11:33:41.286Z	INFO	Amount 1000000

[2:33:57 PM] 2024-08-08T11:33:41.287Z	INFO	Sending tx...

[2:33:57 PM] 2024-08-08T11:33:41.804Z	INFO	Sender balance: 295.4

[2:34:07 PM] 2024-08-08T11:33:53.038Z	INFO	compiled FungibleToken: 11.234s

[2:34:07 PM] 2024-08-08T11:33:53.038Z	INFO	compiled: 11.234s

[2:34:39 PM] 2024-08-08T11:34:21.657Z	INFO	proved tx: 28.018s

[2:34:39 PM] 2024-08-08T11:34:21.657Z	INFO	prepared tx: 40.370s

[2:34:39 PM] 2024-08-08T11:34:22.073Z	INFO	send token tx sent: hash: 5JteL8odAqVYkCVL8HyLhBHw6U1REoryc63Ye7DE1KA6dUQ7WNu6 status: pending

[2:34:39 PM] 2024-08-08T11:34:22.074Z	INFO	RSS memory finished: 1311 MB, changed by 1213 MB

[2:34:39 PM] 2024-08-08T11:34:22.074Z	INFO	zkCloudWorker Execute Sync: 44.401s

[2:34:39 PM] 2024-08-08T11:34:22.152Z	INFO	Lambda call: charge id: 23c2d207-4c6e-4e62-9530-c407a2fb7f95

[2:34:39 PM] 2024-08-08T11:34:22.221Z	INFO	Success: S3File: put

[2:34:39 PM] 2024-08-08T11:34:22.913Z	INFO	zkCloudWorker Execute: 45.242s

[2:34:39 PM] REPORT RequestId: Duration: 45699.82 ms	Billed Duration: 45700 ms	Memory Size: 10240 MB	Max Memory Used: 1547 MB	Init Duration: 933.75 ms

[2:34:39 PM] Token transfer result: 5JteL8odAqVYkCVL8HyLhBHw6U1REoryc63Ye7DE1KA6dUQ7WNu6
[2:34:39 PM] Tokens sent: 1:04.416 (m:ss.mmm)
[2:34:39 PM] RSS memory Tokens sent: 341 MB, changed by -7 MB
```
