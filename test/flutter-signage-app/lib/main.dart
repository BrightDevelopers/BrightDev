import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

const String kVideoUrlBigBuckBunny =
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const String kVideoUrlElephantsDream =
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

void main() {
  runApp(const SignageApp());
}

class SignageApp extends StatelessWidget {
  const SignageApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BrightSign Signage Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: const SignageScreen(),
    );
  }
}

class SignageScreen extends StatefulWidget {
  const SignageScreen({super.key});

  @override
  State<SignageScreen> createState() => _SignageScreenState();
}

class _SignageScreenState extends State<SignageScreen> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;
  int _currentVideoIndex = 0;

  final List<String> _videoUrls = [
    kVideoUrlBigBuckBunny,
    kVideoUrlElephantsDream,
  ];

  @override
  void initState() {
    super.initState();
    _initializeVideo(_videoUrls[_currentVideoIndex]);
  }

  void _initializeVideo(String url) {
    _controller = VideoPlayerController.networkUrl(Uri.parse(url))
      ..initialize().then((_) {
        setState(() => _isInitialized = true);
        _controller.play();
        _controller.setLooping(true);
      });
  }

  void _switchToNextVideo() {
    _controller.dispose();
    setState(() {
      _isInitialized = false;
      _currentVideoIndex = (_currentVideoIndex + 1) % _videoUrls.length;
    });
    _initializeVideo(_videoUrls[_currentVideoIndex]);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Column(
        children: [
          _buildHeader(),
          _buildVideoArea(),
          _buildInfoPanel(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      color: const Color(0xFF1A1A2E),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: const Text(
        'BrightSign Signage Demo',
        style: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: Colors.white,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildVideoArea() {
    return Expanded(
      child: Stack(
        alignment: Alignment.bottomLeft,
        children: [
          _buildVideoPlayer(),
          _buildVideoOverlayLabel(),
        ],
      ),
    );
  }

  Widget _buildVideoPlayer() {
    if (!_isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }
    return SizedBox.expand(
      child: FittedBox(
        fit: BoxFit.cover,
        child: SizedBox(
          width: _controller.value.size.width,
          height: _controller.value.size.height,
          child: VideoPlayer(_controller),
        ),
      ),
    );
  }

  Widget _buildVideoOverlayLabel() {
    final videoName = _currentVideoIndex == 0
        ? 'Big Buck Bunny'
        : 'Elephants Dream';
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.black54,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          'Now Playing: $videoName',
          style: const TextStyle(color: Colors.white, fontSize: 14),
        ),
      ),
    );
  }

  Widget _buildInfoPanel() {
    return Container(
      width: double.infinity,
      color: const Color(0xFF16213E),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildInfoText(),
          _buildSwitchVideoButton(),
        ],
      ),
    );
  }

  Widget _buildInfoText() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Flutter Web on BrightSign',
          style: TextStyle(color: Colors.white70, fontSize: 14),
        ),
        Text(
          'Migration Guide Test App',
          style: TextStyle(color: Colors.white38, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildSwitchVideoButton() {
    return ElevatedButton(
      onPressed: _switchToNextVideo,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF0F3460),
      ),
      child: const Text('Switch Video'),
    );
  }
}
